 #include "Arduino.h"
#include "camera.h"
#include <stdio.h>
#include "file.h"
#include "lapse.h"

// begin thermal 
#include <Wire.h> // I2C communication
#include "MLX90640_API.h"
#include "MLX90640_I2C_Driver.h"

paramsMLX90640 mlx90640;
static float mlx90640To[768];
// end thermal

const byte MLX90640_address = 0x33; //Default 7-bit unshifted address of the MLX90640

#define TA_SHIFT 8 //Default shift for MLX90640 in open air

// end thermal 


unsigned long fileIndex = 0;
unsigned long lapseIndex = 0;
unsigned long frameInterval = 1000;
bool mjpeg = true;
bool lapseRunning = false;
unsigned long lastFrameDelta = 0;
unsigned long maxImages = 10000;


//Returns true if the MLX90640 is detected on the I2C bus
boolean isConnected()
{
  Wire.beginTransmission((uint8_t)MLX90640_address);
  if (Wire.endTransmission() != 0)
    return (false); //Sensor did not ACK
  return (true);
}



void setInterval(unsigned long delta)
{
    frameInterval = delta;
}

void setMaxCount(unsigned long maxCt)
{
    maxImages = maxCt;
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

bool processLapse(unsigned long dt)
{
    if(!lapseRunning) return false;
    if(fileIndex > maxImages) return false;

    lastFrameDelta += dt;
    if(lastFrameDelta >= frameInterval)
    {
        lastFrameDelta -= frameInterval;
        camera_fb_t *fb = NULL;
        esp_err_t res = ESP_OK;
        fb = esp_camera_fb_get();
        if (!fb)
        {
	        Serial.println("Camera capture failed");
	        return false;
        }

        char path[32];
        sprintf(path, "/lapse%03d/pic%05d.jpg", lapseIndex, fileIndex);
        Serial.println(path);
        if(!writeFile(path, (const unsigned char *)fb->buf, fb->len))
        {
            lapseRunning = false;
            return false;
        }
        fileIndex++;
        esp_camera_fb_return(fb);

        // begin thermal
        // read thermal image
        for (byte x = 0 ; x < 2 ; x++) //Read both subpages
        {
          uint16_t mlx90640Frame[834];
          int status = MLX90640_GetFrameData(MLX90640_address, mlx90640Frame);
          if (status < 0)
          {
            Serial.print("GetFrame Error: ");
            Serial.println(status);
          }

          float vdd = MLX90640_GetVdd(mlx90640Frame, &mlx90640);
          float Ta = MLX90640_GetTa(mlx90640Frame, &mlx90640);

          float tr = Ta - TA_SHIFT; //Reflected temperature based on the sensor ambient temperature
          float emissivity = 0.95;

          MLX90640_CalculateTo(mlx90640Frame, &mlx90640, emissivity, tr, mlx90640To);
        }

        if (isConnected() == false)
        {
          Serial.println("MLX90640 not detected at default I2C address. Please check wiring. Freezing.");
          while (1);
        }
        Serial.println("MLX90640 online");

        //Get device parameters - We only have to do this once
        int status;
        uint16_t eeMLX90640[832];
        status = MLX90640_DumpEE(MLX90640_address, eeMLX90640);
        if (status != 0)
          Serial.println("Failed to load system parameters");

        status = MLX90640_ExtractParameters(eeMLX90640, &mlx90640);
        if (status != 0)
          Serial.println("Parameter extraction failed");

        // end get device params

        // write thermal image
        Serial.println("begin image");
        for (uint8_t h=0; h<24; h++) {// Row – 24 rows   

          for (uint8_t w=0; w<32; w++) {// Column – 32 columns

            float val = mlx90640To[ h * 32 + w ];      
            Serial.print(val, 1);
            // Serial.print(mlx90640To[ x * 24 + y ], 2);
            Serial.print(" ");

          }
          Serial.println();
        }
        Serial.println("end image");
        // end thermal

    }
    return true;
}

