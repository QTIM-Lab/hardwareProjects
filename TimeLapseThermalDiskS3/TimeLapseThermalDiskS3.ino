#include <WiFi.h>
#include "file.h"
#include "camera.h"
#include "lapse.h"

#include <Wire.h>


//const char *ssid = "hogback";
//const char *password = "bubba1966";

#include "sd_read_write.h"
#include "SD_MMC.h"

#define SD_MMC_CMD 38 //Please do not modify it.
#define SD_MMC_CLK 39 //Please do not modify it. 
#define SD_MMC_D0  40 //Please do not modify it.


// void startCameraServer();

void setup()
{
	//Serial.println("hello1");
  Serial.begin(115200);
	Serial.setDebugOutput(true);
	Serial.println("hello from setup timeLapseS3");

  // begin thermal
  Wire.begin();  // use Wire.begin(40, 39);  // for S3 chip
  Wire.setClock(400000); //Increase I2C clock speed to 400kHz

  // Serial.begin(9600);

	Serial.println("about to initFileSystem");
	initFileSystem();
	Serial.println("done initFileSystem");
  // pinMode(LED_BUILTIN, OUTPUT);
  // digitalWrite(LED_BUILTIN, LOW);
  // from freenove Sketch_04.1_SDMMC_Test
	SD_MMC.setPins(SD_MMC_CLK, SD_MMC_CMD, SD_MMC_D0);
  if (!SD_MMC.begin("/sdcard", true, true, SDMMC_FREQ_DEFAULT, 5)) {
    Serial.println("Card Mount Failed");
    return;
  }

  Serial.println("about to initFileSystem");  
  uint8_t cardType = SD_MMC.cardType();
  if(cardType == CARD_NONE){
      Serial.println("No SD_MMC card attached");
      return;
  }
  Serial.println("Found SD_MMC card");

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

  // uint64_t cardSize = SD_MMC.cardSize() / (1024 * 1024);
  // Serial.printf("SD_MMC Card Size: %lluMB\n", cardSize);

  // listDir(SD_MMC, "/", 0);

  // createDir(SD_MMC, "/mydir");
  // listDir(SD_MMC, "/", 0);

  // removeDir(SD_MMC, "/mydir");
  // listDir(SD_MMC, "/", 2);

  // writeFile(SD_MMC, "/hello.txt", "Hello ");
  // appendFile(SD_MMC, "/hello.txt", "World!\n");
  // readFile(SD_MMC, "/hello.txt");

  // deleteFile(SD_MMC, "/foo.txt");
  // renameFile(SD_MMC, "/hello.txt", "/foo.txt");
  // readFile(SD_MMC, "/foo.txt");

  // testFileIO(SD_MMC, "/test.txt");
  
  // Serial.printf("Total space: %lluMB\r\n", SD_MMC.totalBytes() / (1024 * 1024));
  // Serial.printf("Used space: %lluMB\r\n", SD_MMC.usedBytes() / (1024 * 1024));    

  initCamera();
  setInterval(5000);
  setMaxCount(3);
  startLapse();
}

void loop()
{
	unsigned long t = millis();
	static unsigned long ot = 0;
	unsigned long dt = t - ot;
	ot = t;
	processLapse(dt);
}



