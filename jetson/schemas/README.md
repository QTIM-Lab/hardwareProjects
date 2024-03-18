# Sensor Data Storage Server README

## Introduction

The Sensor Data Storage Server is designed to serve as a central repository for diverse sensor data coming from a variety of sources. As an integral component of a broader IoT ecosystem, the server captures readings, stores them, and provides the groundwork for subsequent analytics, dashboards, and reporting. The idea is not only to just hold the raw data but to organize it in a way that supports immediate insights about the data's origin, type, and the timing of its capture.

## System Objectives

1. **Scalability**: Accommodate data from an ever-growing number of diverse sensors.
2. **Flexibility**: Seamlessly integrate new types of sensor data without major schema modifications.
3. **Insightful Dashboarding**: Lay the groundwork for a dashboard that offers insights into sensor counts, data values, and collection timestamps.
4. **Relational Integrity**: Maintain relational integrity so that each reading can be traced back to its originating sensor, data type, and timestamp.

## Schema Intent

### **1. `sensors` and `sensor_types` Tables:**

These tables collectively catalogue all sensors in the ecosystem. While `sensors` captures individual sensor details, `sensor_types` classifies these sensors. This dual structure makes adding a new category of sensors to the system straightforward.

### **2. `data_types` Table:**

This table is central to the server's flexibility. When sensors send data, they do not send raw values alone; they send data types. `data_types` helps the system understand the nature of the data (e.g., image, motion) and where it should be stored. The inclusion of a description and unit for each data type aids in comprehensive reporting.

### **3. `readings` Table:**

Acting as the heart of the system, this table records each data reading, linking it to its originating sensor, its type, and its timestamp. Despite its pivotal role, its design enables quick additions of new readings without the need to constantly alter the table for different data types.

### **4. Data-specific Tables (`image_data`, `thermal_image_data`, `motion_data`):**

These tables are the raw storage houses for each type of sensor reading. The system's design allows for easy addition of new tables as more sensor data types are integrated.

## Usage and Expansion

To expand with new sensor data types:

1. Create a new table for the specific data type.
2. Add an entry to the `data_types` table, linking it to the new data table.
3. Ensure the new sensor, if of a new category, has its type added to `sensor_types`.

## to recreate an empty db

```
sqlite3 dev.db < schema.sql
sqlite3 dev.db < add_prediction_table.sql
```

## In Conclusion

This Sensor Data Storage Server is not just a passive storage system. It's an active part of an IoT solution, designed with the foresight of expansion, robust dashboarding, and efficient querying. As sensors evolve and grow in numbers, the system stands ready to scale with them, ensuring that every bit of data finds its proper home and can be put to meaningful use.
