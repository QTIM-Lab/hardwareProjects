-- Insert sensor types
INSERT INTO sensor_types (name) VALUES
    ('Temperature Sensor'),
    ('Motion Sensor'),
    ('Image Sensor');

-- Insert sensors
INSERT INTO sensors (sensor_id, type_id, mac_address) VALUES
    ('sensor_1', 1, '00:1A:79:00:00:01'),
    ('sensor_2', 2, '00:1A:79:00:00:02'),
    ('sensor_3', 3, '00:1A:79:00:00:03');

-- Insert data types
INSERT INTO data_types (name, description, units) VALUES
    ('Temperature Data', 'Temperature readings from sensors', 'Celsius'),
    ('Motion Data', 'Motion detected by sensors', 'Boolean'),
    ('Image Data', 'Image data captured by sensors', 'File Path');

-- Insert motion data
INSERT INTO motion_data (motion_detected) VALUES
    (1),
    (0),
    (1);

-- Insert image data
INSERT INTO image_data (filename, peopleDetected) VALUES
    ('image1.jpg', 2),
    ('image2.jpg', 3),
    ('image3.jpg', 1);

-- Insert thermal image data
INSERT INTO thermal_image_data (filename) VALUES
    ('thermal1.jpg'),
    ('thermal2.jpg'),
    ('thermal3.jpg');

-- Insert pods
INSERT INTO pods (pod_id, location, description) VALUES
    ('pod_1', 'Location 1', 'Description 1'),
    ('pod_2', 'Location 2', 'Description 2'),
    ('pod_3', 'Location 3', 'Description 3');

-- Insert sensor pod history
INSERT INTO sensor_pod_history (sensor_id, pod_id, assignment_timestamp) VALUES
    ('sensor_1', 'pod_1', '2023-01-01 10:00:00'),
    ('sensor_2', 'pod_1', '2023-01-01 10:05:00'),
    ('sensor_3', 'pod_1', '2023-01-01 10:10:00'),
    ('sensor_1', 'pod_2', '2023-01-02 10:00:00'),
    ('sensor_2', 'pod_2', '2023-01-02 10:05:00'),
    ('sensor_3', 'pod_3', '2023-01-03 10:00:00');


-- Insert readings
INSERT INTO readings (sensor_id, time_write, time_read, data_type_id, data_id) VALUES
    (1, datetime('now'), 1636120000, 1, 1),
    (2, datetime('now'), 1636120600, 2, 2),
    (3, datetime('now'), 1636121200, 3, 3);
