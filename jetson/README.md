# Sensor Database

These modules are a draft implementation of code to allow "Sensors" to send data via http to a server that marshals the data into an SQLite database. The goal of the code is to support room monitoring with temperature sensors which should provide sufficient information to determine how many people are in the room, without being able to determine who the room occupants are.  In addition to the database and server there is a client that renders a dashboard of realtime information.

The server's responsibility is providing a secure API that the sensors can use add data to the database.

The client will render information like the number of readings over a time period and the estimated number of people in the room at any given time. It will also provide access to log files including any error information from any sensor. 


See the README in db_webservice to learn more about the Database schema and the Server API.


### Hardware configurations

One configuration we aim to support is the database being hosted on a Jetson Nano and each sensor being a separate ESP32 or other micro processor. The expectation is that multiple sensors will exist in a room and the Jetson will collect data from multiple rooms.

Another configuration that is supported is development mode. The server and database run on the developer's hardware. The sensors can be "real" hardware or simulated via, for example, events sent via curl commands.


### Requirments

1. Must be able to run without accessing a local network

To address this requirement, it is expected that the Jetson can be configured as an Access Point, in essence providing a private network for the sensors to communicate on.


## Database Install

### install sqlite3

```
sudo apt install sqlite3
```


## create db

Make the database. We'll have dev.db and prod.db.
After creating, set the schema and then populate the dev db with some fake data.

```
sqlite3 dev.db < schemas/schema.sql
sqlite3 dev.db < schemas/dev_data.sql
```

## Start the server

## Run the server
```
node db_webservice/db_webserver.js
```

