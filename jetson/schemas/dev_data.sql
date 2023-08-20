-- Sensor types
INSERT INTO sensor_types (name) VALUES ('Temperature');
INSERT INTO sensor_types (name) VALUES ('Camera');
INSERT INTO sensor_types (name) VALUES ('Motion');

-- Sensors
INSERT INTO sensors (name, type_id, mac_address) VALUES ('Temperature Sensor 1', 1, 'AA:BB:CC:DD:EE:01');
INSERT INTO sensors (name, type_id, mac_address) VALUES ('fake data test sensor', 2, 'AA:BB:CC:DD:EE:02');
INSERT INTO sensors (name, type_id, mac_address) VALUES ('curl sensor', 3, 'AA:BB:CC:DD:EE:03');

-- Data types
INSERT INTO data_types (name, description, units) VALUES ('motion_events', 'Motion events', '');
INSERT INTO data_types (name, description, units) VALUES ('image_data', 'Image data with people count', 'count');
INSERT INTO data_types (name, description, units) VALUES ('thermal_events', 'Thermal image events', '');

-- Image data
INSERT INTO image_data (filename, peopleDetected) VALUES ('image1.jpg', 5);
INSERT INTO image_data (filename, peopleDetected) VALUES ('image2.jpg', 2);
INSERT INTO image_data (filename, peopleDetected) VALUES ('image3.jpg', 3);

-- Motion events
INSERT INTO motion_data (motion_detected) VALUES ("true");
INSERT INTO motion_data (motion_detected) VALUES ("false");

-- Readings for image data
INSERT INTO readings (sensor_id, time_write, time_read, data_type_id, data_id) VALUES (2, 1645000000, 5000, 1, 1);
INSERT INTO readings (sensor_id, time_write, time_read, data_type_id, data_id) VALUES (2, 1645000100, 5010, 1, 2);
INSERT INTO readings (sensor_id, time_write, time_read, data_type_id, data_id) VALUES (2, 1645000200, 5020, 1, 3);

-- Readings for motion events
INSERT INTO readings (sensor_id, time_write, time_read, data_type_id, data_id) VALUES (3, 1645000250, 5000, 2, 1);
INSERT INTO readings (sensor_id, time_write, time_read, data_type_id, data_id) VALUES (3, 1645000300, 5010, 2, 2);
