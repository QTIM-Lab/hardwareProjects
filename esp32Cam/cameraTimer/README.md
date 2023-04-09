
# Camera timer to SD Card

## Uses a timer with a call back to take a picture and save to SD card

The code sets up the camera and the SD card reader. With a timer, the code will save a picture on an interval. 

### Known Issues

1. The LED fires roughly when the picture is taken. J read somewhere that it's because the pin for the SD card access is the same as for the LED flash. 

2. Seems like every third image causes a system crash and reboot. 



