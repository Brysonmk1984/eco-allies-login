require('dotenv').load();
const express = require('express');
const app = express();
const Sequelize = require('sequelize');
const dbUrl = process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : "postgres://admin:admin@localhost/ecoAlliesLogin";
const db = new Sequelize(dbUrl);

  // http server
app.listen( process.env.PORT || 3001, function () {
    console.log('Listening on port ' + (process.env.PORT || 3001));

    db.sync().then(function(){
        require('./app')(app);
    });
});