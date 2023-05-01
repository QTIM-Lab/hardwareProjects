/*
  Read the temperature pixels from the MLX90640 IR array
  By: Nathan Seidle
  SparkFun Electronics
  Date: May 22nd, 2018
  License: MIT. See license file for more information but you can
  basically do whatever you want with this code.

  Feel like supporting open source hardware?
  Buy a board from SparkFun! https://www.sparkfun.com/products/14769

  This example initializes the MLX90640 and outputs the 768 temperature values
  from the 768 pixels.

  This example will work with a Teensy 3.1 and above. The MLX90640 requires some
  hefty calculations and larger arrays. You will need a microcontroller with 20,000
  bytes or more of RAM.

  This relies on the driver written by Melexis and can be found at:
  https://github.com/melexis/mlx90640-library

  Hardware Connections:
  Connect the SparkFun Qwiic Breadboard Jumper (https://www.sparkfun.com/products/14425)
  to the Qwiic board
  Connect the male pins to the Teensy. The pinouts can be found here: https://www.pjrc.com/teensy/pinout.html
  Open the serial monitor at 9600 baud to see the output
*/

// Thermal camera stuff
#include <Wire.h>
#include "MLX90640_API.h"
#include "MLX90640_I2C_Driver.h"

const byte MLX90640_address = 0x33; //Default 7-bit unshifted address of the MLX90640

#define TA_SHIFT 8 //Default shift for MLX90640 in open air

static float mlx90640To[768];
paramsMLX90640 mlx90640;



// SD card via MMC
#include "sd_read_write.h"
#include "SD_MMC.h"

#define SD_MMC_CMD 38 //Please do not modify it.
#define SD_MMC_CLK 39 //Please do not modify it. 
#define SD_MMC_D0  40 //Please do not modify it.

#define MLX_ROWS 24
#define MLX_COLS 32

unsigned long fileIndex = 0;  // counter for filenames
char filename[32]; // buffer to hold filenames: "/thermal_xxx.txt"
char floatStr[8]; // buffer big enough for 7-character float
char rowStr[256] = "";  // buffer for 32 floats with 1 digit precision, \n, NULL: "xx.x xx.x ... \nNULL" 


void setupAndTestMMC() {
    Serial.begin(115200);
    SD_MMC.setPins(SD_MMC_CLK, SD_MMC_CMD, SD_MMC_D0);
    if (!SD_MMC.begin("/sdcard", true, true, SDMMC_FREQ_DEFAULT, 5)) {
      Serial.println("Card Mount Failed");
      return;
    }
    uint8_t cardType = SD_MMC.cardType();
    if(cardType == CARD_NONE){
        Serial.println("No SD_MMC card attached");
        return;
    }

    Serial.print("SD_MMC Card Type: ");
    if(cardType == CARD_MMC){
        Serial.println("MMC");
    } else if(cardType == CARD_SD){
        Serial.println("SDSC");
    } else if(cardType == CARD_SDHC){
        Serial.println("SDHC");
    } else {
        Serial.println("UNKNOWN");
    }

    uint64_t cardSize = SD_MMC.cardSize() / (1024 * 1024);
    Serial.printf("SD_MMC Card Size: %lluMB\n", cardSize);

    listDir(SD_MMC, "/", 0);

    createDir(SD_MMC, "/mydir2");
    listDir(SD_MMC, "/", 0);

    removeDir(SD_MMC, "/mydir2");
    listDir(SD_MMC, "/", 2);

    writeFile(SD_MMC, "/hello2.txt", "Hello ");
    appendFile(SD_MMC, "/hello2.txt", "World!\n");
    // readFile(SD_MMC, "/hello2.txt");

    // deleteFile(SD_MMC, "/foo.txt");
    // renameFile(SD_MMC, "/hello.txt", "/foo.txt");
    // readFile(SD_MMC, "/foo.txt");

    // testFileIO(SD_MMC, "/test.txt");
    
    Serial.printf("Total space: %lluMB\r\n", SD_MMC.totalBytes() / (1024 * 1024));
    Serial.printf("Used space: %lluMB\r\n", SD_MMC.usedBytes() / (1024 * 1024));
}

void setupMLX90460() {

  // These pins just need to be GPIO, they'll be used for I2C communication
  Wire.begin(47, 21); // These pins are available on the S3

  Wire.setClock(400000); //Increase I2C clock speed to 400kHz

  Serial.begin(115200);
  Serial.println('started setup');
  // while (!Serial); //Wait for user to open terminal
  // Serial.println("MLX90640 IR Array Example");

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
}



void setup()
{
  setupMLX90460();  // thermal cam
  setupAndTestMMC();
}




void loop()
{
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

  Serial.println("begin image");
  sprintf(filename, "/thermal_%03d.txt", fileIndex);
  // writeFile(SD_MMC, filename, "");
  // appendFile(SD_MMC, filename, "World!\n");
  for (uint8_t h=0; h < MLX_ROWS; h++) {// Row – 24 rows   
    for (uint8_t w=0; w < MLX_COLS; w++) {// Column – 32 columns

      float val = mlx90640To[ h * MLX_COLS + w ];

      dtostrf(val, 5, 1, floatStr); // https://arduino.stackexchange.com/questions/26832/how-do-i-convert-a-float-into-char
      strcat(rowStr, floatStr); 
      strcat(rowStr, " ");
      //appendFile(SD_MMC, filename, floatStr); 
      Serial.print(val, 1);
      Serial.print(" ");

      // appendFile(SD_MMC, filename, " ");

    }

    strcat(rowStr, "\n");
    Serial.println();
    Serial.print("rowstr:");
    Serial.println(rowStr);
    appendFile(SD_MMC, filename, rowStr);
    rowStr[0] = '\0'; // empty the string by making the first char a NULL
  }

  Serial.println("end image");
  fileIndex++;

  delay(10000);
}

//Returns true if the MLX90640 is detected on the I2C bus
boolean isConnected()
{
  Wire.beginTransmission((uint8_t)MLX90640_address);
  if (Wire.endTransmission() != 0)
    return (false); //Sensor did not ACK
  return (true);
}

