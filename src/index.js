require('dotenv').config();
const express = require('express');
const app = express();
const SerialPort = require('serialport');
const Sensor = require('./sds011/wrapper');
const firebase = require('firebase/app');

// Add the Firebase products that you want to use
require('firebase/app');
require('firebase/database');
require('firebase/auth');
require('firebase/analytics');
require('firebase/firestore');

var port = normalizePort(process.env.PORT || '3030');

// You have to include the your Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DB_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const checkValue = process.env.IS_ACTIVE;
console.log(`Checking The Sensor Active Type: ${checkValue}`);

SerialPort.list().then((ports) => {
  ports.forEach(function (port) {
    console.log(port);
    // My SDS011 Device's VendorID = 1A86 and ProductID = 7523
    // I have to specific and indicate the hardware series because my port selection will be done automatically
    if (port['vendorId'] === '1a86' && port['productId'] === '7523') {
      console.log(port);
      console.log(`Checking Device Port Path ${port['path']}`);
      startSensor(checkValue, port['path']);
    }
  });
});

app.get('/', function (req, res) {
  res.send('Air Quality Monitoring System');
});

app.listen(port, function () {
  console.log('App listening on port 3030!');
});

function startSensor(isActive, sensorPort) {
  const sensor = new Sensor(sensorPort);
  if (isActive === true) {
    sensor
      .setReportingMode('active')
      .then(() => {
        console.log('Sensor is now working in active mode.');
        return sensor.setWorkingPeriod(0); // Sensor will send data as soon as new data is available.
      })
      .then(() => {
        console.log('Working period set to 0 minutes.');
        console.log('\nSensor readings:');

        // Since working period was set to 0 and mode was set to active, this event will be emitted as soon as new data is received.
        sensor.on('measure', (data) => {
          const userKey = database.ref().child('particles').push().key;
          const today = new Date();
          const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
          const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
          const dateTime = date + ' ' + time;
          const firebaseModel = {
            id: userKey,
            dateTime: dateTime,
            pm25: data['PM2.5'],
            pm10: data['PM10']
          };
          console.log(`Adding Data`, firebaseModel);
          database.ref().child('particles').child(userKey).set(firebaseModel);
          console.log(`This is active sensor`);
          console.log(`[${dateTime}] ${JSON.stringify(data)}`);
        });
      });
  } else {
    sensor
      .setReportingMode('query')
      .then(() => {
        console.log('Sensor is now working in query mode.');
        return sensor.setWorkingPeriod(0);
      })
      .then(() => {
        console.log('Working period set to 0 minutes.\n');

        // Request data each second.
        setInterval(() => {
          console.log('Querying...');

          // Data will be received only when requested.
          // Keep in mind that sensor (laser & fan) is still continuously working because working period is set to 0.
          sensor.query().then((data) => {
            const userKey = database.ref().child('particles').push().key;
            const today = new Date();
            const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
            const dateTime = date + ' ' + time;
            const firebaseModel = {
              id: userKey,
              dateTime: dateTime,
              pm25: data['PM2.5'],
              pm10: data['PM10']
            };
            console.log(`Adding Data`, firebaseModel);
            database.ref().child('particles').child(userKey).set(firebaseModel);
            console.log(`This is query sensor`);
            console.log(`Received: ` + JSON.stringify(data));
          });
        }, 5000);
      });
  }
}

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
