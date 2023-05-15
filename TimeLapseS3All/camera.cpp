#include "Arduino.h"
#include "camera.h"



// WARNING!!! Make sure that you have either selected ESP32 Wrover Module, or another board which has PSRAM enabled
// Select camera model
//#define CAMERA_MODEL_WROVER_KIT
//#define CAMERA_MODEL_ESP_EYE
//#define CAMERA_MODEL_M5STACK_PSRAM
//#define CAMERA_MODEL_M5STACK_WIDE
//#define CAMERA_MODEL_AI_THINKER
#define CAMERA_MODEL_ESP32S3_EYE // Has PSRAM


#include "camera_pins.h"

bool initCamera()
{
  camera_config_t config;
	config.ledc_channel = LEDC_CHANNEL_0;
	config.ledc_timer = LEDC_TIMER_0;
	config.pin_d0 = Y2_GPIO_NUM;
	config.pin_d1 = Y3_GPIO_NUM;
	config.pin_d2 = Y4_GPIO_NUM;
	config.pin_d3 = Y5_GPIO_NUM;
	config.pin_d4 = Y6_GPIO_NUM;
	config.pin_d5 = Y7_GPIO_NUM;
	config.pin_d6 = Y8_GPIO_NUM;
	config.pin_d7 = Y9_GPIO_NUM;
	config.pin_xclk = XCLK_GPIO_NUM;
	config.pin_pclk = PCLK_GPIO_NUM;
	config.pin_vsync = VSYNC_GPIO_NUM;
	config.pin_href = HREF_GPIO_NUM;
	config.pin_sscb_sda = SIOD_GPIO_NUM;
	config.pin_sscb_scl = SIOC_GPIO_NUM;
	config.pin_pwdn = PWDN_GPIO_NUM;
	config.pin_reset = RESET_GPIO_NUM;
	config.xclk_freq_hz = 20000000;

  config.frame_size = FRAMESIZE_UXGA;
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 12;
  config.fb_count = 1;


	//init with high specs to pre-allocate larger buffers
	if (psramFound())
	{
		config.jpeg_quality = 10;
		config.fb_count = 2;
    config.grab_mode = CAMERA_GRAB_LATEST;
	}
	else
	{
		config.frame_size = FRAMESIZE_SVGA;
    config.fb_location = CAMERA_FB_IN_DRAM;
	}

#if defined(CAMERA_MODEL_ESP_EYE)
  Serial.println("setting pinMode for 13 and 14");
	pinMode(13, INPUT_PULLUP);
	pinMode(14, INPUT_PULLUP);
#endif

	// camera init
  Serial.println("about to init camera");
  Serial.println("config");
	esp_err_t err = esp_camera_init(&config);
	if (err != ESP_OK)
	{
		Serial.printf("Camera init failed with error 0x%x", err);
		return false;
	}

	sensor_t *s = esp_camera_sensor_get();
	//initial sensors are flipped vertically and colors are a bit saturated
  Serial.println(s->id.PID);
	if (s->id.PID == OV3660_PID)
	{
		s->set_vflip(s, 1);		  //flip it back
		s->set_brightness(s, 1);  //up the blightness just a bit
		s->set_saturation(s, -2); //lower the saturation
	}
	//drop down frame size for higher initial frame rate
	s->set_framesize(s, FRAMESIZE_QVGA);

#if defined(CAMERA_MODEL_M5STACK_WIDE)
	s->set_vflip(s, 1);
	s->set_hmirror(s, 1);
#endif
  return true;
}
