-- add_prediction_table.sql

CREATE TABLE predictions (
  id INTEGER PRIMARY KEY,
  reading_id INTEGER,
  reading_time DATETIME, -- duplicate from reading table, for convenience
  prediction_result TEXT,  -- Can store JSON or any text-based prediction result
  prediction_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reading_id) REFERENCES readings(id)
);
