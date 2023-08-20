CREATE TABLE sensors (
  id INTEGER PRIMARY KEY,
  name TEXT,
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
