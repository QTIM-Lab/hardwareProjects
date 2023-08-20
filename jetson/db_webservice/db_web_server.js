const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer  = require('multer');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 3001;
const secret = 'mysecretkey';

// Open the SQLite database
const db = new sqlite3.Database('dev.db');

// this ain't right, should be read from the detabase
// there is a table with the event types (called data_types)
const IMAGE_EVENT = 1;
const MOTION_EVENT = 2;


// Middleware to check JWT token and set req.user
function authenticateToken(req, res, next) {
    // Temporarily disable security
    req.user = { username: 'dummyUser' }; // Set a dummy user object
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

// Define a route for getting sensor data
app.get('/api/sensors', authenticateToken, (req, res) => {
  // Query the database for sensor data
  db.all('SELECT * FROM sensors', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

// Define a route for getting sensor data
app.get('/api/data_types', authenticateToken, (req, res) => {
  // Query the database for sensor data
  db.all('SELECT * FROM data_types', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

// Define a route for getting sensor type data
app.get('/api/sensor-types', authenticateToken, (req, res) => {
  // Query the database for sensor type data
  db.all('SELECT * FROM sensor_types', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

// Define a route for getting readings data
app.get('/api/readings', authenticateToken, (req, res) => {
  // Query the database for readings data
  db.all('SELECT * FROM readings', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

// Define a route for getting image data
app.get('/api/image-data', authenticateToken, (req, res) => {
  // Query the database for image data
  db.all('SELECT * FROM image_data', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

// Define a route for getting motion event data
app.get('/api/motion-readings', authenticateToken, (req, res) => {

  console.log("got a motion-readings request");
  // Query the database for motion event data
  db.all('SELECT * FROM motion_data', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

app.get('/api/thermal-readings', authenticateToken, (req, res) => {

  console.log("got a thermal-readings request");
  // Query the database for motion event data
  db.all('SELECT * FROM thermal_image_data', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Return the data as JSON
      res.json(rows);
    }
  });
});

app.get('/api/people-detected', authenticateToken, (req, res) => {
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
        res.status(500).json({ error: 'Internal server error' });
      } else {
        // Return the data as JSON
        res.json(rows);
      }
    });
  });


// Writing apis from sensors



function addReading(sensor_id, time_read, event_id, data_id, db, callback) {
  let readingsData = [null, sensor_id, time_read, Date.now(), event_id, data_id];
  let readingsQuery = 'INSERT INTO readings VALUES (?, ?, ?, ?, ?, ?)';
  db.run(readingsQuery, readingsData, callback);
}


app.post('/motion-reading', (req, res) => {
  const { sensor_id, motion, time_read } = req.body;
  const MOTION_EVENT_ID = 1;

  console.log("got a motion-reading request - sensor:" + sensor_id + " time: " + time_read);

  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON;');
    db.run('BEGIN TRANSACTION');

    // Step 1: Add to motion_data table
    let motionQuery = 'INSERT INTO motion_data(motion_detected) VALUES (?)';
    db.run(motionQuery, [motion], function (err) {
      if (err) {
        console.log(" error in the motion query");
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      console.log(` added motion query, row: ${this.lastID}`);

      let motionId = this.lastID;

      // Step 2: Add to readings table
      addReading(sensor_id, time_read, MOTION_EVENT_ID, motionId, db, (err) => {
        if (err) {
          console.log(" Error with reading, rolling back");
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        db.run('COMMIT', (commitErr) => {
          if (commitErr) {
            db.run('ROLLBACK');
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


app.post('/image-reading', (req, res) => {
  const { sensor_id, image_path, people_detected, time_read } = req.body;
  const IMAGE_EVENT_ID = 2;

  console.log("Got an image-reading request - sensor: " + sensor_id + " time: " + time_read);

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    let imageQuery = 'INSERT INTO image_data(filename, peopleDetected) VALUES (?, ?)';
    db.run(imageQuery, [image_path, people_detected], function (err) {
      if (err) {
        console.log(" Error in the image query");
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      console.log(` Added image_data, row: ${this.lastID}`);
      let imageId = this.lastID;

      addReading(sensor_id, time_read, IMAGE_EVENT_ID, imageId, db, (err) => {
        if (err) {
          console.log(" Error with reading, rolling back");
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        
        db.run('COMMIT', (commitErr) => {
          if (commitErr) {
            db.run('ROLLBACK');
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


// app.post('/thermal-reading', (req, res) => {

//   const THERMAL_IMAGE_EVENT_ID = 3;

//   const sensor_id = req.body.sensor_id;
//   const time_read = req.body.time_read;
//   const thermal_data = req.body.thermal_data;

//   console.log("Got a thermal-reading request - sensor: " + sensor_id + " time: " + time_read);
//   // console.log("thermal data:");
//   // console.log(thermal_data);

//   // Write thermalData to a .txt file
//   const filepath = `./images/${sensor_id}_${time_read}.txt`;
//   fs.writeFileSync(filepath, thermal_data);

//   db.serialize(() => {
//     db.run('BEGIN TRANSACTION');

//     // Step 1: Add to image_data table
//     let thermalImageQuery = 'INSERT INTO thermal_image_data(filename) VALUES (?)';
//     db.run(thermalImageQuery, [filepath], function (err) {
//       if (err) {
//         console.log(" Error in the image query");
//         return res.status(500).json({ error: err.message });
//       }
//       console.log(` Added thermal_image_data, row: ${this.lastID}`);

//       let image_id = this.lastID;

//       // Step 2: Add to readings table - res returned from there
//       addReading(sensor_id, time_read, THERMAL_IMAGE_EVENT_ID, image_id, db, res);
//     });
//   });
// });

app.post('/thermal-reading', (req, res) => {
  const THERMAL_IMAGE_EVENT_ID = 3;

  const { sensor_id, time_read, thermal_data } = req.body;

  console.log("Got a thermal-reading request - sensor: " + sensor_id + " time: " + time_read);

  // Write thermalData to a .txt file
  const filepath = `./images/${sensor_id}_${time_read}.txt`;
  fs.writeFileSync(filepath, thermal_data);

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    let thermalImageQuery = 'INSERT INTO thermal_image_data(filename) VALUES (?)';
    db.run(thermalImageQuery, [filepath], function (err) {
      if (err) {
        console.log(" Error in the image query");
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      console.log(` Added thermal_image_data, row: ${this.lastID}`);
      let image_id = this.lastID;

      addReading(sensor_id, time_read, THERMAL_IMAGE_EVENT_ID, image_id, db, (err) => {
        if (err) {
          console.log(" Error with reading, rolling back");
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        db.run('COMMIT', (commitErr) => {
          if (commitErr) {
            db.run('ROLLBACK');
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


app.post('/api/get-thermal-image', (req, res) => {
  const imageId = req.body.image_id;

  console.log("Received a request for a thermal image - image_id: " + imageId);

  // Query the database for the filename of the requested thermal image
  let thermalImageQuery = 'SELECT filename FROM thermal_image_data WHERE id = ?';
  db.get(thermalImageQuery, [imageId], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    } else if (!row) {
      return res.status(404).json({ error: 'No image found with the provided id' });
    } else {
      // The filename of the thermal image was found in the database
      const filepath = row.filename;
      
      // Read the thermal image file as a binary string
      fs.readFile(filepath, 'binary', (err, file) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to read the image file' });
        } else {
          // Return the thermal image as a binary string
          return res.status(200).json({ image_data: file });
        }
      });
    }
  });
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/images')  // Replace with the directory where you want to save the images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)  // Generate unique filename
  }
})
const upload = multer({ storage: storage })

app.post('/upload', upload.single('image'), function (req, res, next) {
  // req.file is the 'image' file 
  // req.body will hold the text fields, if there were any 
  res.send('File uploaded successfully!');
})

// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });



// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on network port ${port}`);
});
