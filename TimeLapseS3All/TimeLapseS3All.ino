#define DEBUG_ESP_PORT Serial  
#define CORE_DEBUG_LEVEL 0 // can be 0-5: None, Err, Warn, Info, Debug, Verbose

#include "file.h"
#include "camera.h"
#include "lapse.h"

#include <Wire.h>
#include "MLX90640_API.h"
#include "MLX90640_I2C_Driver.h"

const byte MLX90640_address = 0x33; //Default 7-bit unshifted address of the MLX90640
static float mlx90640To[768];
paramsMLX90640 mlx90640;

#include "sd_read_write.h"
#include "SD_MMC.h"

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

String ssid = "read from config";   // to do, I don't trust String due to memory fragmentation, but okay for now?
String password = "read from config";  

// // Set your Static IP address
// IPAddress local_IP(192, 168, 4, 184);
// // Set your Gateway IP address
// IPAddress gateway(192, 168, 4, 1);

// IPAddress subnet(255, 255, 255, 0);
// IPAddress primaryDNS(8, 8, 8, 8);   // optional
// IPAddress secondaryDNS(8, 8, 4, 4); // optional

// const char* logApi = "/api/log";

#define SENSOR_ID "2" // fake data test sensor
// each sensor will need a unique ID, also part of the config file?


#define SD_MMC_CMD 38 // Pin for SD card access
#define SD_MMC_CLK 39 // Pin for SD card access 
#define SD_MMC_D0  40 // Pin for SD card access

#define PYE_IR_PIN 42 // Pin for motion sensor signal
const unsigned long MOTION_INTERVAL=1000;
const char* motionFileLog = "/Motion.log";

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

// todo, handle wifi events 
// see https://www.upesy.com/blogs/tutorials/how-to-connect-wifi-acces-point-with-esp32#
// void setupWiFi () 
// {
//     WiFi.mode(WIFI_STA); //Optional

//     // // Configures static IP address
//     // if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
//     //   Serial.println("STA Failed to configure");
//     // }

//     WiFi.begin(ssid, password);
//     Serial.println("\nConnecting");

//     while(WiFi.status() != WL_CONNECTED){
//         Serial.print(".");
//         delay(100);
//     }
    
//     Serial.println("\nConnected to the WiFi network");
//     Serial.print("Local ESP32 IP: ");
//     Serial.println(WiFi.localIP());
// }

// IP address in the same subnet as your server
IPAddress staticIP(192,168,4,50); // For example

// Gateway and Subnet mask. Assuming your router's IP is 192.168.4.1
IPAddress gateway(192,168,4,1);
IPAddress subnet(255,255,255,0);

void setupWiFi () 
{
    loadNetworkPassword();
    Serial.println("connecting to:");
    Serial.println(ssid);
    Serial.println(password);

    WiFi.mode(WIFI_STA);
    WiFi.config(staticIP, gateway, subnet);
    WiFi.begin(ssid, password);
    Serial.println("\nConnecting");

    while(WiFi.status() != WL_CONNECTED){
        Serial.print(".");
        delay(100);
    }
    
    Serial.println("\nConnected to the WiFi network");
    Serial.print("Local ESP32 IP: ");
    Serial.println(WiFi.localIP());
}

void loadNetworkPassword () 
{ 
    File configFile = SD_MMC.open("/config.txt");
    if (!configFile) {
      Serial.println("Failed to open config file");
      return;
    }

    const size_t capacity = 512;
    StaticJsonDocument<capacity> doc;

    char buffer[capacity];
    int bytesRead = configFile.readBytes(buffer, sizeof(buffer) - 1);
    buffer[bytesRead] = '\0'; // null terminate the C-string

    DeserializationError error = deserializeJson(doc, buffer);
    if (error) {
      Serial.println("Failed to parse config file - is it bigger than 512 bytes?");
      return;
    }

    String env = doc["environment"];
    ssid = doc[env]["ssid"].as<String>();
    password = doc[env]["password"].as<String>();

    configFile.close();
}



void get_network_info(){
    if(WiFi.status() == WL_CONNECTED) {
        Serial.print("[*] Network information for ");
        Serial.println(ssid);

        Serial.println("[+] BSSID : " + WiFi.BSSIDstr());
        Serial.print("[+] Gateway IP : ");
        Serial.println(WiFi.gatewayIP());
        Serial.print("[+] Subnet Mask : ");
        Serial.println(WiFi.subnetMask());
        Serial.println((String)"[+] RSSI : " + WiFi.RSSI() + " dB");
        Serial.print("[+] ESP32 IP : ");
        Serial.println(WiFi.localIP());
    }
}

void setup()
{
  Serial.begin(115200);

  Serial.println("entering setup");

	initFileSystem(); // needed? - redundant with setupAndTestMMC call to SD_MMC.begin() ?
  Serial.println("InitFileSystem, done");

  pinMode(LED_BUILTIN, OUTPUT);    // turn off led - needed?
  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("LED off, done");

  setupAndTestMMC();
  Serial.println("MMC test, done");
  initCamera();
  Serial.println("camera setup");
  setupMLX90460();
  Serial.println("thermal camera setup");

  Serial.println("about to setup wifi");
  setupWiFi();
  Serial.println("done - setup wifi");
  get_network_info();
  Serial.println("setupWiFi, done");

  setInterval(60000);
  setMaxCount(1000);
  setThermalCamData(MLX90640_address, mlx90640To, mlx90640);

  pinMode(PYE_IR_PIN, INPUT);

  startLapse();
}

void loop()
{
	unsigned long t = millis();
	static unsigned long ot = 0;
	unsigned long dt = t - ot;
	ot = t;
	processLapse(dt);


  static int lastMotionState = 0;
  static unsigned long lastMotionCheckTime = 0;
  unsigned long curMotionDelta = t - lastMotionCheckTime;
  if (curMotionDelta > MOTION_INTERVAL) {
    lastMotionCheckTime = t;
    byte state = digitalRead(PYE_IR_PIN);
      
    // if (state == 1) Serial.println("Motion detected");
    // else if (state == 0) Serial.println("No Motion detected");
    const char* detectedMsg = "Motion detected";
    const char* noMotionMsg = "No motion";

    const char * msg = noMotionMsg;
    if (state == 1) {
      msg = detectedMsg;
    }

    if (lastMotionState != state) {
      appendFile(SD_MMC, motionFileLog, msg);
      Serial.println(msg);
      char timeMsg[128] = "";
      sprintf(timeMsg, "  time %lu\n", t);
      appendFile(SD_MMC, motionFileLog, timeMsg);
      Serial.println(timeMsg);
      lastMotionState = state;

      sendHttpMotionData(t, state);
    }
  }
}


void sendHttpMotionData(unsigned long time_read, bool motion) {
  if (WiFi.status() == WL_CONNECTED) { 

      HTTPClient http;
      StaticJsonDocument<200> obj;  // Create a static JSON document with 200 bytes

      // Add some key/value pairs
      obj["sensor_id"] = SENSOR_ID;
      obj["motion"] = motion ? "true" : "false";
      obj["time_read"] = time_read;

      // Generate the string to send
      String httpRequestData;
      serializeJson(obj, httpRequestData);

      const char* protocol = "http://";
      const char* host = "192.168.4.122:";  // this will become an IP address
      const char* port = "3001/";
      const char* route = "motion-reading";

      int totalLength = strlen(protocol) + strlen(host) + strlen(port) + strlen(route) + 1;  // +1 for null terminator

      char url[totalLength];  // make sure this is large enough to hold the entire URL
      sprintf(url, "%s%s%s%s", protocol, host, port, route);

      Serial.print("sending to:");
      Serial.println(url);
      Serial.print("sending: ");
      Serial.println(httpRequestData);

      http.begin(url);  // Specify destination for HTTP request
      http.addHeader("Content-Type", "application/json");  // Specify content-type header

      //String httpRequestData = "{\"time\":\"value\"}";  // Create JSON data to send
      int httpResponseCode = http.POST(httpRequestData);  // Send the actual POST request

      if (httpResponseCode>0) {
        Serial.println("got a response");
        String response = http.getString();  // Get the response to the request
        Serial.println(httpResponseCode);   // Print HTTP return code
        Serial.println(response);           // Print request response payload
      } else {
        Serial.println("failed");
        Serial.print("Error on sending POST: ");
        Serial.println(httpResponseCode);
      }

      http.end();  // Close connection

  }
}

//Returns true if the MLX90640 is detected on the I2C bus
boolean isConnected()
{
  Wire.beginTransmission((uint8_t)MLX90640_address);
  if (Wire.endTransmission() != 0)
    return (false); //Sensor did not ACK
  return (true);
}
