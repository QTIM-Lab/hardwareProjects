#include "file.h"
#include "camera.h"
#include "lapse.h"

#include <Wire.h>
#include "MLX90640_API.h"
#include "MLX90640_I2C_Driver.h"

const byte MLX90640_address = 0x33; //Default 7-bit unshifted address of the MLX90640

// #define TA_SHIFT 8 //Default shift for MLX90640 in open air

static float mlx90640To[768];
paramsMLX90640 mlx90640;


#include "sd_read_write.h"
#include "SD_MMC.h"

#define SD_MMC_CMD 38 //Please do not modify it.
#define SD_MMC_CLK 39 //Please do not modify it. 
#define SD_MMC_D0  40 //Please do not modify it.


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

    // createDir(SD_MMC, "/mydir2");
    // listDir(SD_MMC, "/", 0);

    // removeDir(SD_MMC, "/mydir2");
    // listDir(SD_MMC, "/", 2);

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
  Serial.begin(115200);

	initFileSystem(); // needed?
  pinMode(LED_BUILTIN, OUTPUT);    // turn off led - needed?
  digitalWrite(LED_BUILTIN, LOW);

  setupAndTestMMC();
  initCamera();
  setupMLX90460();

  setInterval(10000);
  setMaxCount(1000);
  setThermalCamData(MLX90640_address, mlx90640To, mlx90640);

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

//Returns true if the MLX90640 is detected on the I2C bus
boolean isConnected()
{
  Wire.beginTransmission((uint8_t)MLX90640_address);
  if (Wire.endTransmission() != 0)
    return (false); //Sensor did not ACK
  return (true);
}
