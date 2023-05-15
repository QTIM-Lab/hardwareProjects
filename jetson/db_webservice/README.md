# Web Server

This is a microservice with a couple priorities:

  1. define and implement a webservice API that communicates with the sensor database
  2. Authenticate requests for db information
  3. run the db queries and massage the data appropriately to return json packets


## Dependencies

This runs using node.js and uses express to do the https processing.
Best is to install Node Version Manager (nvm) to get the appropriate Node version and Node Package Manager (npm).  Then we use npm to get the libraries like express and sqlite3.

NVM is found here
https://github.com/nvm-sh/nvm/blob/master/README.md

after it's installed, 
```
nvm install node
```
will get the latest node and npm.


Then we need the webservice dependencies:
```
npm install 
```
will install the dependencies in the package file including 
express sqlite3 jsonwebtoken body-parser
