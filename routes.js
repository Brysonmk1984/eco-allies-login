const Sequelize = require('sequelize');
const dbUrl = process.env.NODE_ENV === 'PRODUCTION' ? process.env.DB_URL : "postgres://admin:admin@localhost/ecoAlliesLogin";
const db = new Sequelize(dbUrl);
const UserModel = require('./models');
const bodyParser = require("body-parser");


module.exports = function(app){
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

   // CREATE NEW ACCOUNT
    app.post('/create', function(req, res){
        const user = UserModel(db, Sequelize);
        
        // Check if password matches second password inpu
        if(req.body.password !== req.body.passwordConfirm){
            res.json({ requestType : 'POST', success : false, error : 'Passwords do not match!' });
            return;
        }

        user.create({
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