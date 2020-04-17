require('dotenv-flow').config();
var express = require('express');
var app = express();
const SerialPort = require('serialport');
const Sensor = require('./wrapper');
var firebase = require('firebase/app');
// Add the Firebase products that you want to use
require('firebase/app');
require('firebase/database');
require('firebase/auth');
require('firebase/analytics');
require('firebase/firestore');
var port = normalizePort(process.env.PORT || '3030');

const firebaseConfig = {
  apiKey: 'AIzaSyDUEAa3CtD7sh0YjxfEPohJBDfxN0V74VQ',
  authDomain: 'airquality-92f14.firebaseapp.com',
  databaseURL: 'https://airquality-92f14.firebaseio.com',
  projectId: 'airquality-92f14',
  storageBucket: 'airquality-92f14.appspot.com',
  messagingSenderId: '479750944181',
  appId: '1:479750944181:web:f1ed78c465774d07dad5fc',
  measurementId: 'G-BQQXG7WFNR',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const checkValue = process.env.IS_ACTIVE;
console.log(`Checking The Sensor Active Type: ${checkValue}`);

SerialPort.list().then((ports) => {
  ports.forEach(function (port) {
    console.log(port);
    if (port['vendorId'] === '1a86' && port['productId'] === '7523') {
      console.log(port);
      console.log(`Checking Device Port Path ${port['path']}`);
      startSensor(checkValue, port['path']);
    }
  });
});

app.get('/', function (req, res) {
  res.send('Air Quality Detection System');
});

app.listen(port, function () {
  console.log('App listening on port 8081!');
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
          var today = new Date();
          var date =
            today.getFullYear() +
            '-' +
            (today.getMonth() + 1) +
            '-' +
            today.getDate();
          var time =
            today.getHours() +
            ':' +
            today.getMinutes() +
            ':' +
            today.getSeconds();
          var dateTime = date + ' ' + time;
          const firebaseModel = {
            id: userKey,
            dateTime: dateTime,
            pm25: data['PM2.5'],
            pm10: data['PM10'],
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
            var today = new Date();
            var date =
              today.getFullYear() +
              '-' +
              (today.getMonth() + 1) +
              '-' +
              today.getDate();
            var time =
              today.getHours() +
              ':' +
              today.getMinutes() +
              ':' +
              today.getSeconds();
            var dateTime = date + ' ' + time;
            const firebaseModel = {
              id: userKey,
              dateTime: dateTime,
              pm25: data['PM2.5'],
              pm10: data['PM10'],
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
