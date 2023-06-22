#ifndef SENSOR_STATUS_H
#define SENSOR_STATUS_H

#include "constants.h"

class SensorStatus {
public:
    bool tookPicture;
    bool tookThermalImage;
    bool motionDetected;
    char pictureFilename[64]; // problem waiting to happen!
    char thermalFilename[64];

    // Constructor to initialize the object
    SensorStatus() {
        tookPicture = false;
        tookThermalImage = false;
        motionDetected = false;
        setPictureFilename("");
        setThermalFilename("");
    }

    void setPictureFilename(const char* path) {
        strncpy(pictureFilename, path, sizeof(pictureFilename));
        pictureFilename[sizeof(pictureFilename) - 1] = '\0'; // Ensure null-termination
    }

    void setThermalFilename(const char* path) {
        strncpy(thermalFilename, path, sizeof(thermalFilename));
        thermalFilename[sizeof(thermalFilename) - 1] = '\0'; // Ensure null-termination
    }

    String debugPrint() const {
        String status;
        status += "Sensor Status:\n";
        status += " tookPicture: " + String(tookPicture ? "Yes" : "No") + "\n";
        status += " tookThermalImage: " + String(tookThermalImage ? "Yes" : "No") + "\n";
        status += " motionDetected: " + String(motionDetected ? "Yes" : "No") + "\n";
        status += " pictureFilename: " + String(pictureFilename) + "\n";
        status += " thermalFilename: " + String(thermalFilename) + "\n";
        return status;
    }


};

#endif
