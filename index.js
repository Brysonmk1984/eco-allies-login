require('dotenv').load();
const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const pg = require('pg');
const Sequelize = require('sequelize');
const dbUrl = process.env.NODE_ENV === 'PRODUCTION' ? process.env.DB_URL : "postgres://admin:admin@localhost/ecoAlliesLogin";
const connection = new Sequelize(dbUrl);

const UserModel = require('./user');

connection
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    
    

    connection.sync().then(function(){
        const User = UserModel(connection, Sequelize);
        const formData = {
            email : 'brysonmk1988@gmail.com',
            password : 'graphic5',
            passwd : 'graphic5',
            publicEthKey : '0x00000000000000000'
        };
        if(formData.password !== formData.passwd){
           throw('PASS MISMATCH!'); 
        }
        User.create({
            email : formData.email,
            password : formData.password,
            publicEthKey : formData.publicEthKey,
        })
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
