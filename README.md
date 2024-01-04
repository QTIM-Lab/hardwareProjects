# hardwareProjects
This project has the code that is on:
the esp32s3s
the jetson
    server
    database
dashboard server and client

Getting started:
plug in jetson to power, monitor, keyboard, mouse
open terminal
"sudo service hostapd start"
enter username/passwd
"sudo service dnsmasq start"
can check with "sudo service hostapd status"

check for availability of jetstego network

cd /Documents/github/hardware/jetson
nvm use v17
nvm ls (to see v17 is being used)
node db_webservice/db_web_server.js  (should start database service, listening on port 3001)

plug in sensor, data should start coming in

on jetson, 
cd /Documents/github/hardware/jetson-dashboard
nvm use v17
nvm ls to confirm v17
npm start

on laptop, join jetstego, navigate to http://192.168.4.1:5001/readings


Freenove ESP32S3 CAM pinout
<br>
<img width = 600 src = "./docs/ESP32S3_pinout.png"></img>

Overall goal: develop a ESP32 based people counter with PIR, cameras and thermal cameras




