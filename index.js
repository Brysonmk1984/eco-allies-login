require('dotenv').load();
const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const pg = require('pg');
const Sequelize = require('sequelize');
const dbUrl = process.env.NODE_ENV === 'PRODUCTION' ? process.env.DB_URL : "postgres://admin:admin@localhost/ecoAlliesLogin";
const sequelize = new Sequelize(dbUrl);

console.log('!!!!', process.env.NODE_ENV);
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
