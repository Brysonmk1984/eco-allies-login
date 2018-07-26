const path = require('path');
const express = require('express');
// sequelize
const Sequelize = require('sequelize');
const dbUrl = process.env.NODE_ENV === 'PRODUCTION' ? process.env.DB_URL : "postgres://admin:admin@localhost/ecoAlliesLogin";
const db = new Sequelize(dbUrl);
// parsers
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// express-validator
const { buildCheckFunction, validationResult } = require('express-validator/check');
const checkBody = buildCheckFunction(['body']);
// express-session
const session = require('express-session');

const UserModel = require('./models');



module.exports = function(app){
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(session({
        secret: '1123ddsgfdrtrthsds',
        resave: false,
        saveUninitialized: false,
        //cookie: { secure: true }
    }))
    
  
   // CREATE NEW ACCOUNT
    app.post('/create', [
        checkBody('username', 'Username field cannot be empty.').exists(),
        checkBody('username', 'Username must be between 4-20 characters long.').isLength({ min: 5, max: 20 }),
        checkBody('email', 'The email you entered is invalid, please try again.').isEmail(),
        checkBody('email', 'Email address must be between 4-100 characters long, please try again.').isLength({ min: 4, max: 100 }),
        checkBody('password', 'Password must be between 8-100 characters long.').isLength({ min: 8, max: 100 }),
        //checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i"),
        checkBody('passwordConfirm', 'Password must be between 8-100 characters long.').isLength({ min: 8, max: 100 }),
        checkBody('passwordConfirm', 'Passwords do not match, please try again.').custom((value, { req }) => value === req.body.password),
        // Additional validation to ensure username is alphanumeric with underscores and dashes
        checkBody('username', 'Username can only contain letters, numbers, or underscores.').matches(/^[A-Za-z0-9_-]+$/, 'i'),
    ], function(req, res){
        const user = UserModel(db, Sequelize);
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.json({ requestType : 'POST', success : false, error : errors.array() });
            return;
        }

        user.create({
            username : req.body.username,
            email : req.body.email,
            password : req.body.password,
            publicEthKey : req.body.publicEthKey,
        })
        .then((user)=>{
            res.send(user);
        })
        .catch((err) =>{
            res.json({ requestType : 'POST', success : false, error : err });
        });
    });

    // LOGIN TO EXISTING ACCOUNT
    app.post('/login', function(req, res){
        const user = UserModel(db, Sequelize);
        //Check if password is correct
        user.find({
            where : {
                email : req.body.email
            }
        })
        .then((user) => {
            console.log('THE USER', user);
            res.send(user);
        })
        .catch((err) =>{
            res.json({ requestType : 'POST', success : false, error : err });
        });

    });

};