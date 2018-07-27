const path = require('path');
const express = require('express');
const cors = require('cors')
// sequelize
const Sequelize = require('sequelize');
const dbUrl = process.env.NODE_ENV === 'PRODUCTION' ? process.env.DB_URL : "postgres://admin:admin@localhost/ecoAlliesLogin";
//const db = new Sequelize(dbUrl);
const db = new Sequelize('ecoAlliesLogin', 'admin', 'admin', {
    host: 'localhost',
    dialect: 'postgres',
    storage: "./session.postgres",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    operatorsAliases: false
  });
// parsers
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// express-validator
const { buildCheckFunction, validationResult } = require('express-validator/check');
const checkBody = buildCheckFunction(['body']);
// express-session & passport
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
// initalize sequelize with session store
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const bcrypt = require('bcrypt-nodejs');

const UserModel = require('./models');
const user = UserModel(db, Sequelize);


module.exports = function(app){
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(session({
        secret: '1123ddsgfdrtrthsds',
        resave: false,
        saveUninitialized: false,
        store: new SequelizeStore({
            db
        }),
        proxy: true // if you do SSL outside of node.
        //cookie: { secure: true }
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());

    passport.use(new LocalStrategy({
        usernameField:'email', passwordField:'password'
        },
        function(email, password, done) {
            console.log('LOOOOK', email, password);

            user.find({
                where : {
                    email
                },
                attributes:['id','email', 'password']
            })
            .then((user)=>{
                //console.log('FOUND USER!', user.dataValues.password, password);

                bcrypt.compare(password, user.dataValues.password, function(err, isMatch){
                    if(err){console.log(err);}
                    if(isMatch){
                    
                        return done(null, user, {message : 'matttttch'});
                    } else {
                        return done(null, false, {message : 'Password did not match'});
                    }
                })
            })
            .error(function(error){
                console.log(error);
                return done(error, null);
            });

        }
    ));
    
  
   // REGISTER NEW ACCOUNT
    app.post('/register', [
        checkBody('username', 'Username field cannot be empty.').exists(),
        checkBody('username', 'Username must be between 4-30 characters long.').isLength({ min: 5, max: 30 }),
        checkBody('email', 'The email you entered is invalid, please try again.').isEmail(),
        checkBody('email', 'Email address must be between 4-100 characters long, please try again.').isLength({ min: 4, max: 100 }),
        checkBody('password', 'Password must be between 8-100 characters long.').isLength({ min: 8, max: 100 }),
        //checkBody("password", "Password must include one lowercase character, one uppercase character, a number, and a special character.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/, "i"),
        checkBody('passwordConfirm', 'Password must be between 8-100 characters long.').isLength({ min: 8, max: 100 }),
        checkBody('passwordConfirm', 'Passwords do not match, please try again.').custom((value, { req }) => value === req.body.password),
        // Additional validation to ensure username is alphanumeric with underscores and dashes
        checkBody('username', 'Username can only contain letters, numbers, or underscores.').matches(/^[A-Za-z0-9_-]+$/, 'i'),
    ], function(req, res){
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
            req.login(user.id, function(err){
                res.send(user);
            });
        })
        .catch((err) =>{
            res.json({ requestType : 'POST', success : false, error : err });
        });
    });

    // LOGIN TO EXISTING ACCOUNT
    app.post('/login', function(req, res, next){
        passport.authenticate('local',function(err, user, info){
            console.log('!!! USER', user);
            if (err) return next(err);
            if (!user.email) {
                return res.json({
                    message: "no user found"
                });
            }

            // Manually establish the session...
            req.login(user.email, function(err) {
                if (err) return next(err);
                return res.json({
                    message: 'user authenticated',
                });
            });
        })(req, res, next);
    });

    app.get('/loggedin', authenticationMiddleware(), function(req, res, err){
        console.log('MADE IT');
    });

};

passport.serializeUser(function(userId, done) {
    done(null, userId);
});
  
passport.deserializeUser(function(userId, done) {
    done(null, userId);
});

function authenticationMiddleware(){
    return (req, res, next) => {
        console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
        if(req.isAuthenticated()) {
            return next();
        }else{
            res.send('should be redirecting here... means session not found');
            return false;
        }

        
        
    }
}