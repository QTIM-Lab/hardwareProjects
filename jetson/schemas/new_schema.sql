CREATE TABLE sensors (
  db_id INTEGER PRIMARY KEY AUTOINCREMENT,
  sensor_id TEXT UNIQUE,
  type_id INTEGER,
  mac_address TEXT UNIQUE,
  FOREIGN KEY (type_id) REFERENCES sensor_types(id)
);

CREATE TABLE sensor_types (
  id INTEGER PRIMARY KEY,
  name TEXT
);

CREATE TABLE data_types (
  id INTEGER PRIMARY KEY,
  name TEXT,  -- the name of the table that has the data
  description TEXT,
  units TEXT
);

CREATE TABLE readings (
  id INTEGER PRIMARY KEY,
  sensor_id INTEGER,
  time_write DATETIME, -- time of the row being added
  time_read INTEGER, -- sensor clock time of the reading
  data_type_id INTEGER,   -- the row of the data_types table with the data
  data_id INTEGER,  -- the row of the table with the data - this is really a FOREIGN_KEY, but we don't know which table
  FOREIGN KEY (data_type_id) REFERENCES data_types(id)
  FOREIGN KEY (sensor_id) REFERENCES sensors(id)
);

CREATE TABLE image_data (
  id INTEGER PRIMARY KEY,
  filename TEXT,
  peopleDetected INTEGER
);

CREATE TABLE thermal_image_data (
  id INTEGER PRIMARY KEY,
  filename TEXT
);

CREATE TABLE motion_data (
  id INTEGER PRIMARY KEY,
  motion_detected INTEGER  -- row for each change 
);


-- Create Pods table
CREATE TABLE pods (
    db_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pod_id TEXT UNIQUE,
    location TEXT,
    description TEXT
);

-- Insert a row for the unassigned pod
INSERT INTO pods (db_id, pod_id, description)
VALUES (0, 'Unassigned', 'Unassigned Pod: This pod serves as a placeholder for sensors that have not been assigned to a specific pod.');

-- Create Sensor_Pod_History table
CREATE TABLE sensor_pod_history (
    db_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id TEXT,
    pod_id TEXT,
    assignment_timestamp DATETIME,
    FOREIGN KEY (sensor_id) REFERENCES sensors(sensor_id),
    FOREIGN KEY (pod_id) REFERENCES pods(pod_id)
);

