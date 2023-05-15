const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3001;
const secret = 'mysecretkey';

// Open the SQLite database
const db = new sqlite3.Database('dev.db');

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

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
app.get('/api/motion-events', authenticateToken, (req, res) => {
  // Query the database for motion event data
  db.all('SELECT * FROM motion_events', (err, rows) => {
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


// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
