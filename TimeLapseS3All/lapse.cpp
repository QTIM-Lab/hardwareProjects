#include "Arduino.h"
#include "camera.h"

#include <stdio.h>
#include "file.h"

#include "lapse.h"
#include "sd_read_write.h"
#include "SD_MMC.h"



unsigned long fileIndex = 0;
unsigned long lapseIndex = 0;
unsigned long frameInterval = 1000;
bool mjpeg = true;
bool lapseRunning = false;
unsigned long lastFrameDelta = 0;
unsigned long maxImages = 10000;

// Thermal cam MLX-90460, 24x32 thermal images
#define MLX_ROWS 24
#define MLX_COLS 32

unsigned long fileIndexTherm = 0;  // counter for filenames

char floatStr[8]; // buffer big enough for 7-character float
char rowStr[256] = "";  // buffer for 32 floats with 1 digit precision, \n, NULL: "xx.x xx.x ... \nNULL" 


void setInterval(unsigned long delta)
{
    frameInterval = delta;
}

void setMaxCount(unsigned long maxCt)
{
    maxImages = maxCt;
}

byte MLX90640_address;
float* mlx90640To; // pointer to a buffer of 768 floats
paramsMLX90640 mlx90640a;

void setThermalCamData(const byte& inMLX90640_address, float* inMlx90640To, const paramsMLX90640& inMlx90640)
{
  MLX90640_address = inMLX90640_address;
  mlx90640To = inMlx90640To;
  mlx90640a = inMlx90640;
}

bool takeAndStoreThermalPic(const char* filename) {

    for (byte x = 0 ; x < 2 ; x++) //Read both subpages
    {
        uint16_t mlx90640Frame[834];
        int status = MLX90640_GetFrameData(MLX90640_address, mlx90640Frame);
        if (status < 0)
        {
        Serial.print("GetFrame Error: ");
        Serial.println(status);
        }

        float vdd = MLX90640_GetVdd(mlx90640Frame, &mlx90640a);
        float Ta = MLX90640_GetTa(mlx90640Frame, &mlx90640a);

        float tr = Ta - TA_SHIFT; //Reflected temperature based on the sensor ambient temperature
        float emissivity = 0.95;

        MLX90640_CalculateTo(mlx90640Frame, &mlx90640a, emissivity, tr, mlx90640To);
    }

    for (uint8_t h=0; h < MLX_ROWS; h++) {// Row – 24 rows   
        for (uint8_t w=0; w < MLX_COLS; w++) {// Column – 32 columns

            float val = mlx90640To[ h * MLX_COLS + w ];

            dtostrf(val, 5, 1, floatStr); // https://arduino.stackexchange.com/questions/26832/how-do-i-convert-a-float-into-char
            strcat(rowStr, floatStr); 
            strcat(rowStr, " ");
        }

        strcat(rowStr, "\n");
        appendFile(SD_MMC, filename, rowStr);
        rowStr[0] = '\0'; // empty the string by making the first char a NULL
    }

    fileIndexTherm = fileIndexTherm + 1.0;
    Serial.print("thermal image saved: ");
    Serial.println(filename);

    return true;
}

bool takeAndStorePic(const char* filename) 
{
    camera_fb_t *fb = NULL;
    esp_err_t res = ESP_OK;
    fb = esp_camera_fb_get();  
    if (!fb)
    {
        Serial.println("Camera capture failed");
        return false;
    }

    if(!writeFile(filename, (const unsigned char *)fb->buf, fb->len))
    {
        Serial.println("camera save to file failed");
        return false;
    }
    fileIndex++;
    esp_camera_fb_return(fb);

    return true;
}

bool startLapse()
{
    if(lapseRunning) return true;
    fileIndex = 0;
    char path[32];
    for(; lapseIndex < 10000; lapseIndex++)
    {
        sprintf(path, "/lapse%03d", lapseIndex);
        if (!fileExists(path))
        {
            createDir(path);
            lastFrameDelta = 0;
            lapseRunning = true;
            return true;
        }
    }
	return false;
}

bool stopLapse()
{
    lapseRunning = false;
}



SensorStatus processLapse(unsigned long dt)
{
    SensorStatus status;  

    if(!lapseRunning) return status;
    if(fileIndex > maxImages) return status;

    lastFrameDelta += dt;
    if(lastFrameDelta >= frameInterval)
    {
        Serial.println("interval complete, taking pics");

        lastFrameDelta -= frameInterval;
        
        char camFileName[64];  // what size is sufficient?
        char thermFileName[64];
        sprintf(camFileName, "/lapse%03d/pic%05d.jpg", lapseIndex, fileIndex);
        sprintf(thermFileName, "/lapse%03d/thermal_%03d.txt", lapseIndex, fileIndexTherm);

        if (takeAndStorePic(camFileName)){
            status.tookPicture = true;
            status.setPictureFilename(camFileName);
            Serial.print("saved cam image - ");
            Serial.println(camFileName);
        }

        Serial.println("taking thermal");
        if (takeAndStoreThermalPic(thermFileName)){
            Serial.println("took the thermal pic");
            status.tookThermalImage = true;
            status.setThermalFilename(thermFileName);
            Serial.print("saved thermal image - ");
            Serial.println(thermFileName);
        }
    }

    return status;
}
