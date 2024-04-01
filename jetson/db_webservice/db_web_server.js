const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path"); // Import the path module
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(bodyParser.json());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/images"); // Replace with the directory where you want to save the images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Generate unique filename
  },
});
const upload = multer({ storage: storage });


const UPLOAD_DIR = "uploads"; // dir to save the images
const PREDICT_URL = "http://localhost:8080/predict";

const port = 3001;
const secret = "mysecretkey";

// Open the SQLite database
const db = new sqlite3.Database("dev.db");

// this ain't right, should be read from the detabase
// there is a table with the event types (called data_types)
const IMAGE_EVENT = 1;
const MOTION_EVENT = 2;

// Middleware to check JWT token and set req.user
function authenticateToken(req, res, next) {
  // Temporarily disable security
  req.user = { username: "dummyUser" }; // Set a dummy user object
  next();

  // Uncomment the following lines when you want to enable security
  /*
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, secret, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
    */
}

app.post("/register-pod", (req, res) => {
  console.log("WRITE Req: register-pod");
  const { pod_id, location, description } = req.body;
  const query =
    "INSERT OR IGNORE INTO pods (pod_id, location, description) VALUES (?, ?, ?)";
  db.run(query, [pod_id, location, description], function (err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res
      .status(200)
      .send({ message: "Pod registered successfully", pod_db_id: this.lastID });
  });
});

app.post("/register-sensor-pod", (req, res) => {
  console.log("WRITE Req: register-sensor-pod");
  const { sensor_id, pod_id } = req.body;
  const checkSensorQuery =
    "INSERT OR IGNORE INTO sensors (sensor_id) VALUES (?)";
  db.run(checkSensorQuery, [sensor_id], function (err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }

    const checkPodQuery = "INSERT OR IGNORE INTO pods (pod_id) VALUES (?)";
    db.run(checkPodQuery, [pod_id], function (err) {
      if (err) {
        res.status(500).send(err.message);
        return;
      }

      const updateSensorPodQuery =
        "INSERT INTO sensor_pod_history (sensor_id, pod_id, assignment_timestamp) VALUES (?, ?, datetime('now'))";
      db.run(updateSensorPodQuery, [sensor_id, pod_id], function (err) {
        if (err) {
          res.status(500).send(err.message);
          return;
        }
        res
          .status(200)
          .send({ message: "Sensor pod assignment updated successfully" });
      });
    });
  });
});

app.get("/api/pods", authenticateToken, (req, res) => {
  console.log("READ Req: pods");
  const query = `
    SELECT 
      pods.pod_id,
      pods.location,
      pods.description,
      sensors.sensor_id,
      sensors.type_id,
      sensors.mac_address,
      sensor_pod_history.assignment_timestamp
    FROM
      pods
    LEFT JOIN
      sensor_pod_history ON pods.pod_id = sensor_pod_history.pod_id
    LEFT JOIN
      sensors ON sensor_pod_history.sensor_id = sensors.sensor_id
    ORDER BY
      pods.pod_id, sensor_pod_history.assignment_timestamp;

  `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      const podsInfo = {};
      rows.forEach((row) => {
        const podId = row.pod_id;
        if (!podsInfo[podId]) {
          podsInfo[podId] = {
            location: row.location,
            description: row.description,
            sensors: [],
          };
        }
        if (row.sensor_id) {
          podsInfo[podId].sensors.push({
            sensor_id: row.sensor_id,
            type_id: row.type_id,
            mac_address: row.mac_address,
            assignment_timestamp: row.assignment_timestamp,
          });
        }
      });
      res.json(podsInfo);
    }
  });
});

// Define a route for getting sensor data
app.get("/api/sensors", authenticateToken, (req, res) => {
  console.log("READ Req: sensors");
  // Query the database for sensor data
  db.all("SELECT * FROM sensors", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

// Define a route for getting sensor data
app.get("/api/data_types", authenticateToken, (req, res) => {
  console.log("READ Req: data_types");
  // Query the database for sensor data
  db.all("SELECT * FROM data_types", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

app.get("/api/current_time", authenticateToken, (req, res) => {
  console.log("READ Req: current_time");

  // Get the current time on the server
  const currentTime = new Date().toLocaleString();

  // Return the current time as JSON
  res.json({ currentTime });
});

// Define a route for getting sensor type data
app.get("/api/sensor-types", authenticateToken, (req, res) => {
  // Query the database for sensor type data
  db.all("SELECT * FROM sensor_types", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

// Define a route for getting readings data
app.get("/api/readings", authenticateToken, (req, res) => {
  console.log("READ Req: readings");
  // Query the database for readings data
  db.all("SELECT * FROM readings", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

// Define a route for getting image data
app.get("/api/image-data", authenticateToken, (req, res) => {
  console.log("READ Req: image-data - wait, should this be retired?");
  // Query the database for image data
  db.all("SELECT * FROM image_data", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

// app.get("/get-thermal-heatmap/:readingId", (req, res) => {
//   const readingId = req.params.readingId;
//   // Assuming you retrieve the filename from the database as in the original API
//   const query = `
//     SELECT id.data_id, thermal_image_data.filename
//     FROM readings AS id
//     JOIN thermal_image_data ON id.data_id = thermal_image_data.id
//     WHERE id.id = ? AND id.data_type_id = 3
//   `;

//   db.get(query, [readingId], (err, row) => {
//     if (err || !row) {
//       return res
//         .status(500)
//         .json({ error: err ? err.message : "Thermal data not found" });
//     }

//     const inputFilePath = path.resolve(row.filename);
//     const outputFilePath = path.resolve(
//       row.filename.replace(".json", `_${readingId}.png`)
//     );

//     // Check if the heatmap already exists
//     if (fs.existsSync(outputFilePath)) {
//       console.log("Heatmap already exists, sending existing file.");
//       return res.sendFile(outputFilePath);
//     }

//     exec(
//       `python3 ./utilities/therm2png9.py ${inputFilePath} ${outputFilePath} 10`,
//       (error, stdout, stderr) => {
//         if (error) {
//           console.error(`exec error: ${error}`);
//           return res
//             .status(500)
//             .json({ error: "Error converting thermal data" });
//         }

//         // Send the PNG file
//         res.sendFile(outputFilePath, (err) => {
//           if (err) {
//             console.error(err);
//             res.status(500).json({ error: "Error sending PNG file" });
//           }
//         });
//       }
//     );
//   });
// });

// Reusable function to generate heatmap
async function generateHeatmap(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    exec(
      `python3 ./utilities/therm2png9.py ${inputFilePath} ${outputFilePath} 10`,
      (error) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject(new Error("Error converting thermal data"));
        }
        resolve(outputFilePath);
      }
    );
  });
}

// Reusable function to call prediction service
async function getPrediction(outputFilePath) {
  const imageBuffer = fs.readFileSync(outputFilePath);
  const formData = new FormData();
  formData.append("file", imageBuffer, path.basename(outputFilePath));

  const predictionResponse = await fetch(PREDICT_URL, {
    method: "POST",
    body: formData,
    headers: formData.getHeaders(),
  });

  if (!predictionResponse.ok) {
    throw new Error(
      `Prediction service error: ${predictionResponse.statusText}`
    );
  }

  return predictionResponse.json();
}

// Reusable function to store prediction result
function storePrediction(readingId, predictionResult, readingTime) {
  return new Promise((resolve, reject) => {
    const insertPredictionQuery = `
      INSERT INTO predictions (reading_id, prediction_result, reading_time)
      VALUES (?, ?, ?)
    `;
    db.run(
      insertPredictionQuery,
      [readingId, JSON.stringify(predictionResult), readingTime],
      (err) => {
        if (err) {
          console.error(`Database error: ${err.message}`);
          reject(err);
        }
        resolve();
      }
    );
  });
}

app.get("/get-thermal-heatmap/:readingId", (req, res) => {
  const readingId = req.params.readingId;

  const query = `
    SELECT readings.time_read, thermal_image_data.filename
    FROM readings
    JOIN thermal_image_data ON readings.data_id = thermal_image_data.id
    WHERE readings.id = ? AND readings.data_type_id = 3
  `;

  db.get(query, [readingId], async (err, row) => {
    if (err || !row) {
      return res
        .status(500)
        .json({ error: err ? err.message : "Thermal data not found" });
    }

    const inputFilePath = path.resolve(row.filename);
    const outputFilePath = path.resolve(
      row.filename.replace(".json", `_${readingId}.png`)
    );

    try {
      if (!fs.existsSync(outputFilePath)) {
        await generateHeatmap(inputFilePath, outputFilePath);
      }

      const predictionData = await getPrediction(outputFilePath);

      await storePrediction(readingId, predictionData.result, row.time_read);

      res.sendFile(outputFilePath);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      if (fs.existsSync(outputFilePath)) {
        // If there's an error but the heatmap exists, send the heatmap
        res.sendFile(outputFilePath);
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  });
});

app.get("/get-thermal/:readingId", (req, res) => {
  const readingId = req.params.readingId;
  console.log("READ Req: thermal data : " + readingId);

  const query = `
    SELECT id.data_id, thermal_image_data.filename 
    FROM readings AS id 
    JOIN thermal_image_data ON id.data_id = thermal_image_data.id 
    WHERE id.id = ? AND id.data_type_id = 3
  `;

  db.get(query, [readingId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (row && row.filename) {
      fs.readFile(path.resolve(row.filename), "utf8", (err, fileContent) => {
        if (err) {
          return res.status(500).json({ error: "Error reading file content" });
        }

        res.setHeader("Content-Type", "text/plain");
        res.send(fileContent);
      });
    } else {
      res.status(404).json({ error: "Thermal data not found" });
    }
  });
});

app.get("/get-latest-thermal-reading/:sensorId", (req, res) => {
  const sensorId = req.params.sensorId;
  console.log("Request: Latest thermal data for sensor: " + sensorId);

  const query = `
    SELECT r.sensor_id, r.time_write, r.time_read, r.id, r.data_id, t.filename
    FROM readings AS r
    JOIN thermal_image_data AS t ON r.data_id = t.id
    WHERE r.sensor_id = ? AND r.data_type_id = 3
    ORDER BY r.time_write DESC
    LIMIT 1;
  `;

  db.get(query, [sensorId], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }

    if (!row) {
      return res.status(404).json({
        error: "Latest thermal reading not found for sensor: " + sensorId,
      });
    }

    const imagePath = path.resolve(row.filename);
    // Read the content of the image file (which is a text file in this case)
    fs.readFile(imagePath, "utf8", (err, fileContent) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Error reading thermal image file" });
      }

      // Replace escaped newlines
      const correctedFileContent = fileContent.replace(/\\n/g, "\n");

      // Send both the file content and the reading data in the response
      res.json({
        sensorId: row.sensor_id,
        readingId: row.id,
        dataId: row.data_id,
        timeWrite: row.time_write,
        timeRead: row.time_read,
        filename: row.filename,
        fileContent: correctedFileContent, // Include the content of the file as a string in the response
      });
    });
  });
});

app.get("/get-image/:readingId", (req, res) => {
  const readingId = req.params.readingId;
  console.log("READ Req: image data : " + readingId);

  // Fetch the image details from the database based on the readingId
  const query = `
    SELECT id.data_id, image_data.filename, image_data.peopleDetected 
    FROM readings AS id 
    JOIN image_data ON id.data_id = image_data.id 
    WHERE id.id = ? AND id.data_type_id = 2
  `;

  db.get(query, [readingId], (err, row) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Failed to fetch image data." });
    }
    if (!row) {
      return res.status(404).json({ error: "Image not found." });
    }

    const imagePath = path.join(UPLOAD_DIR, row.filename);
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        console.error("Failed to read the image:", err);
        return res.status(500).json({ error: "Failed to read the image." });
      }

      // Convert the image data to base64 and send it along with other meta-data
      const imageBase64 = data.toString("base64");
      const responseData = {
        ...row,
        image: imageBase64,
      };

      res.status(200).json(responseData);
    });
  });
});

// Define a route for getting motion event data
app.get("/api/motion-readings", authenticateToken, (req, res) => {
  console.log("READ Req: motion data");
  // Query the database for motion event data
  db.all("SELECT * FROM motion_data", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

app.get("/api/thermal-readings", authenticateToken, (req, res) => {
  console.log("READ Req: thermal readings - should this be retired?");
  // Query the database for motion event data
  db.all("SELECT * FROM thermal_image_data", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

app.get("/api/people-detected", authenticateToken, (req, res) => {
  console.log("READ Req: people detected");
  const query = `
      SELECT r.timestamp, i.peopleDetected
      FROM readings r
      JOIN image_data i ON r.data_id = i.id
      WHERE r.data_type_id = (SELECT id FROM data_types WHERE name = 'image_data')
      ORDER BY r.timestamp;
    `;

  db.all(query, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

// Writing apis from sensors

function addReading(sensor_id, time_read, event_id, data_id, db, callback) {
  console.log("Entering addReading with parameters:", {
    sensor_id,
    time_read,
    event_id,
    data_id,
  });

  let readingsData = [
    null,
    sensor_id,
    Date.now(),
    time_read,
    event_id,
    data_id,
  ];

  let readingsQuery = "INSERT INTO readings VALUES (?, ?, ?, ?, ?, ?)";
  console.log("Executing query:", readingsQuery, "with data:", readingsData);

  db.run(readingsQuery, readingsData, function (err) {
    if (err) {
      console.error("Error executing query:", err.message);
      return callback(err);
    }

    console.log("Query executed successfully, lastID:", this.lastID);
    callback(null);
  });
}

app.post("/motion-reading", (req, res) => {
  const { sensor_id, motion, time_read } = req.body;
  const MOTION_EVENT_ID = 1;

  console.log(
    "WRITE Req: motion - sensor ID:" +
      sensor_id +
      " time: " +
      time_read +
      " motion: " +
      motion
  );

  db.serialize(() => {
    // db.run("PRAGMA foreign_keys = ON;");  // sensor_ids need to be registered!
    db.run("BEGIN TRANSACTION");

    // Step 1: Add to motion_data table
    let motionQuery = "INSERT INTO motion_data(motion_detected) VALUES (?)";
    db.run(motionQuery, [motion], function (err) {
      if (err) {
        console.log(" error in the motion query");
        console.log(err.message);
        console.log(
          "motion: " +
            motion +
            " sensorid: " +
            sensor_id +
            " timeread: " +
            time_read
        );
        db.run("ROLLBACK");
        return res.status(500).json({ error: err.message });
      }
      console.log(` added motion query, row: ${this.lastID}`);

      let motionId = this.lastID;

      // Step 2: Add to readings table
      console.log(" About to addReading");
      console.log(" sensor_id: " + sensor_id + " motionId: " + motionId);
      addReading(sensor_id, time_read, MOTION_EVENT_ID, motionId, db, (err) => {
        if (err) {
          console.log(" Error with reading, rolling back");

          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }

        db.run("COMMIT", (commitErr) => {
          if (commitErr) {
            db.run("ROLLBACK");
            console.log("Transaction failed, rolling back", commitErr);
            return res.status(500).json({ error: commitErr.message });
          }
          console.log("Transaction successful");
          return res.status(200).json({ message: "Success" });
        });
      });
    });
  });
});

app.post("/image-reading", (req, res) => {
  const { sensor_id, image_path, people_detected, time_read, image } = req.body;
  const IMAGE_EVENT_ID = 2;

  console.log(
    "WRITE Req image-reading request - sensor: " +
      sensor_id +
      " time: " +
      time_read
  );

  if (
    sensor_id === undefined ||
    time_read === undefined ||
    image === undefined
  ) {
    console.log("  ** Bad request in image-reading **");
    console.log("  ** REQ - ");
    console.log(req);
    return;
  }

  // 1. Decode the base64 encoded image
  const buffer = Buffer.from(image, "base64");

  // 2. Save the decoded image to a specific directory
  // Assuming `image_path` contains the filename of the image (e.g., "image1.jpg")
  const filePath = path.join(UPLOAD_DIR, image_path);

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.log("Failed to save the image", err);
      return res.status(500).json({ error: "Failed to save the image" });
    } else {
      console.log("wrote to " + filePath);
    }

    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      let imageQuery =
        "INSERT INTO image_data(filename, peopleDetected) VALUES (?, ?)";
      db.run(imageQuery, [image_path, people_detected], function (err) {
        if (err) {
          console.log(" Error in the image query");
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }
        console.log(` Added image_data, row: ${this.lastID}`);
        let imageId = this.lastID;

        addReading(sensor_id, time_read, IMAGE_EVENT_ID, imageId, db, (err) => {
          if (err) {
            console.log(" Error with reading, rolling back");
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }

          db.run("COMMIT", (commitErr) => {
            if (commitErr) {
              db.run("ROLLBACK");
              console.log("Transaction failed, rolling back", commitErr);
              return res.status(500).json({ error: commitErr.message });
            }
            console.log("Transaction successful");
            return res.status(200).json({ message: "Success" });
          });
        });
      });
    });
  });
});

// Endpoint to receive image, send it to prediction service, store the result, and return it
app.post("/predict", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  // Send the image to the prediction service
  const formData = new FormData();
  formData.append("file", req.file.buffer, "image.png");

  try {
    const predictionResponse = await fetch(PREDICT_URL, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!predictionResponse.ok) {
      throw new Error(
        `Error in prediction service: ${predictionResponse.statusText}`
      );
    }

    const predictionData = await predictionResponse.json();
    if (!predictionData.result) {
      throw new Error("No prediction result found");
    }

    // Store the prediction result in the database
    const insertQuery = `
          INSERT INTO prediction_results (image_name, result)
          VALUES (?, ?);
      `;

    db.run(
      insertQuery,
      [req.file.originalname, predictionData.result],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: err.message });
        }

        // Respond with the prediction result
        res.json({ result: predictionData.result });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/thermal-reading", (req, res) => {
  const THERMAL_IMAGE_EVENT_ID = 3;

  const { sensor_id, time_read, thermal_data } = req.body;

  console.log(
    "WRITE Req thermal - sensor: " + sensor_id + " time: " + time_read
  );

  // Write thermalData to a .txt file
  const filepath = `./images/${sensor_id}_${time_read}.json`;
  fs.writeFileSync(filepath, JSON.stringify(thermal_data));

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    let thermalImageQuery =
      "INSERT INTO thermal_image_data(filename) VALUES (?)";
    db.run(thermalImageQuery, [filepath], function (err) {
      if (err) {
        console.log(" Error in the image query");
        db.run("ROLLBACK");
        return res.status(500).json({ error: err.message });
      }
      console.log(` Added thermal_image_data, row: ${this.lastID}`);
      let image_id = this.lastID;

      console.log(" About to addReading");
      console.log(" sensor_id: " + sensor_id + " thermal_id: " + image_id);
      addReading(
        sensor_id,
        time_read,
        THERMAL_IMAGE_EVENT_ID,
        image_id,
        db,
        (err) => {
          if (err) {
            console.log(" Error with reading, rolling back");
            console.log(" Error message: " + err.message);
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }

          db.run("COMMIT", (commitErr) => {
            if (commitErr) {
              db.run("ROLLBACK");
              console.log("Transaction failed, rolling back", commitErr);
              return res.status(500).json({ error: commitErr.message });
            }
            console.log("Transaction successful");
            return res.status(200).json({ message: "Success" });
          });
        }
      );
    });
  });
});

// app.post("/api/get-thermal-image", (req, res) => {
//   const imageId = req.body.image_id;

//   console.log("Received a request for a thermal image - image_id: " + imageId);

//   // Query the database for the filename of the requested thermal image
//   let thermalImageQuery =
//     "SELECT filename FROM thermal_image_data WHERE id = ?";
//   db.get(thermalImageQuery, [imageId], (err, row) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Internal server error" });
//     } else if (!row) {
//       return res
//         .status(404)
//         .json({ error: "No image found with the provided id" });
//     } else {
//       // The filename of the thermal image was found in the database
//       const filepath = row.filename;

//       // Read the thermal image file as a binary string
//       fs.readFile(filepath, "binary", (err, file) => {
//         if (err) {
//           console.error(err);
//           return res
//             .status(500)
//             .json({ error: "Failed to read the image file" });
//         } else {
//           // Return the thermal image as a binary string
//           return res.status(200).json({ image_data: file });
//         }
//       });
//     }
//   });
// });



app.post("/upload", upload.single("image"), function (req, res, next) {
  // req.file is the 'image' file
  // req.body will hold the text fields, if there were any
  res.send("File uploaded successfully!");
});

// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on network port ${port}`);
});
