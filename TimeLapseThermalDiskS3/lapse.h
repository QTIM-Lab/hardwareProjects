#pragma once



void setInterval(unsigned long delta);
void setMaxCount(unsigned long maxCount);
bool startLapse();
bool stopLapse();
bool processLapse(unsigned long dt);
