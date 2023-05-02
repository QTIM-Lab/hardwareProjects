#ifndef _LAPSE_H_
#define _LAPSE_H_
    
#include "MLX90640_API.h"
#include "MLX90640_I2C_Driver.h"
#define TA_SHIFT 8 //Default shift for MLX90640 in open air

void setInterval(unsigned long delta);
void setMaxCount(unsigned long maxCount);
void setThermalCamData(const byte& MLX90640_address, float* mlx90640To, const paramsMLX90640& mlx90640);

bool startLapse();
bool stopLapse();
bool processLapse(unsigned long dt);

    
#endif
