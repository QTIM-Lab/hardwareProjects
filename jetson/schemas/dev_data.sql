-- Sensor types
INSERT INTO sensor_types (name) VALUES ('Temperature');
INSERT INTO sensor_types (name) VALUES ('Camera');
INSERT INTO sensor_types (name) VALUES ('Motion');

-- Sensors
INSERT INTO sensors (name, type_id, mac_address) VALUES ('Temperature Sensor 1', 1, 'AA:BB:CC:DD:EE:01');
INSERT INTO sensors (name, type_id, mac_address) VALUES ('Camera 1', 2, 'AA:BB:CC:DD:EE:02');
INSERT INTO sensors (name, type_id, mac_address) VALUES ('Motion Sensor 1', 3, 'AA:BB:CC:DD:EE:03');

-- Data types
INSERT INTO data_types (name, description, units) VALUES ('image_data', 'Image data with people count', 'count');
INSERT INTO data_types (name, description, units) VALUES ('motion_events', 'Motion events', '');

-- Image data
INSERT INTO image_data (filename, timestamp, peopleDetected) VALUES ('image1.jpg', 1645000000, 5);
INSERT INTO image_data (filename, timestamp, peopleDetected) VALUES ('image2.jpg', 1645000100, 2);
INSERT INTO image_data (filename, timestamp, peopleDetected) VALUES ('image3.jpg', 1645000200, 3);

-- Motion events
INSERT INTO motion_events (motion_detected, timestamp) VALUES (1, 1645000250);
INSERT INTO motion_events (motion_detected, timestamp) VALUES (1, 1645000300);

-- Readings for image data
INSERT INTO readings (sensor_id, timestamp, data_type_id, data_id) VALUES (2, 1645000000, 1, 1);
INSERT INTO readings (sensor_id, timestamp, data_type_id, data_id) VALUES (2, 1645000100, 1, 2);
INSERT INTO readings (sensor_id, timestamp, data_type_id, data_id) VALUES (2, 1645000200, 1, 3);

-- Readings for motion events
INSERT INTO readings (sensor_id, timestamp, data_type_id, data_id) VALUES (3, 1645000250, 2, 1);
INSERT INTO readings (sensor_id, timestamp, data_type_id, data_id) VALUES (3, 1645000300, 2, 2);
