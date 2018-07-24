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
        const user = UserModel(connection, Sequelize);
        
        // // CREATE USER
        const formData = {
            email : 'brysonmk1989@gmail.com',
            password : 'graphic5',
            passwd : 'graphic5',
            publicEthKey : '0x00000000000000000'
        };
        if(formData.password !== formData.passwd){
           throw('PASS MISMATCH!'); 
        }
        user.create({
            email : formData.email,
            password : formData.password,
            publicEthKey : formData.publicEthKey,
        }).then((user)=>{
            console.log('U!', user);
        });

        // // READ USER
        // const formData = {
        //     email : 'brysonmk1988@gmail.com',
        //     password : 'graphic5',
        // };

        // user.find({
        //     where : {
        //         email : formData.email
        //     }
        // })
        // .then((user) => {
        //     console.log('THE USER', user);
        // });
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
