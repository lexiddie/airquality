require('dotenv-flow').config();
console.log(process.env);
const port = process.env.AIR_SENSOR_PORT;
console.log(`Checking the port ${port}`);
const Sensor = require('../wrapper.js');
const sensor = new Sensor(port); // Use your system path of SDS011 sensor.

var firebase = require('firebase/app');

// Add the Firebase products that you want to use
require('firebase/app');
require('firebase/database');
require('firebase/auth');
require('firebase/analytics');
require('firebase/firestore');

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
const userKey = database.ref().child('particles').push().key;
const data = { Id: userKey, Date: '16/04/2020', pm25: 3.3, pm10: 10 };
console.log(`Adding Data`, data);
database.ref().child('particles').child(userKey).set(data);

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
      console.log(`[${new Date().toISOString()}] ${JSON.stringify(data)}`);
    });
  });
