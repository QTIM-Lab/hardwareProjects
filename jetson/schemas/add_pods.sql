
BEGIN;

-- Create Pods table
CREATE TABLE Pods (
    pod_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    location TEXT,
    description TEXT
);

-- Insert a row for the unassigned pod
INSERT INTO Pods (pod_id, name, description)
VALUES (0, 'Unassigned', 'Unassigned Pod: This pod serves as a placeholder for sensors that have not been assigned to a specific pod.');

-- Alter Sensors table to add pod_id column
PRAGMA foreign_keys=off;

CREATE TEMPORARY TABLE Sensors_backup AS SELECT * FROM Sensors;

DROP TABLE Sensors;

CREATE TABLE Sensors (
    id INTEGER PRIMARY KEY,
    pod_id INTEGER,
    name TEXT,
    type_id INTEGER,
    mac_address TEXT UNIQUE,
    FOREIGN KEY (type_id) REFERENCES sensor_types(id)
    FOREIGN KEY (pod_id) REFERENCES Pods(pod_id)
);

INSERT INTO Sensors (id, pod_id, name, type_id, mac_address)
SELECT id, 0, name, type_id, mac_address
FROM Sensors_backup;


DROP TABLE Sensors_backup;

PRAGMA foreign_keys=on;

-- Create Sensor_Pod_History table
CREATE TABLE Sensor_Pod_History (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id INTEGER,
    pod_id INTEGER,
    assignment_timestamp DATETIME,
    FOREIGN KEY (sensor_id) REFERENCES Sensors(sensor_id),
    FOREIGN KEY (pod_id) REFERENCES Pods(pod_id)
);

COMMIT;