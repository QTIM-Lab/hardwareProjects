# ESP32 connected to MLX90640 Thermal Camera 

## using I2C communication

The camera has 4 pins:
SCL,
SDA,
GND, and
VCC (3.3V)

VCC and GND are available on the top of the esp32 (left and right).
SCL and SDA connect to GPIO21 and GPIO22 which are on the upper right and marked "wire_sdl" and "wire_sda" on the pinout diagram. Note that they're not adjacent.


<img width="700" alt="exp32PinLayout" src="https://user-images.githubusercontent.com/732047/225186623-c0967b57-5182-4b17-8dd6-a7605c545f1c.png">

![PXL_20230315_014909740](https://user-images.githubusercontent.com/732047/225184094-d873e56a-4947-47cd-b545-c75538d0e643.jpg)
![PXL_20230315_014940884](https://user-images.githubusercontent.com/732047/225184100-f5652c43-d2e5-4d2c-8c6e-c1380a70412a.jpg)