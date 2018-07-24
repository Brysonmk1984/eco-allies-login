const bcrypt = require('bcrypt-nodejs');
const SALT_WORK_FACTOR = 12;

module.exports = function(connection, DataTypes){
    const User = connection.define('users', {
        email: {
            type : DataTypes.STRING,
            unique : true,
            validate : {
                notEmpty :true,
                // ENABLE WHEN READY
                // isUnique : function(value, next){
                //     User.find({
                //         where: {email: value},
                //         attributes: ['id']
                //     })
                //     .done(function(error, user) {
                //         if (error){
                //             // Some unexpected error occured with the find method.
                //             return next(error);
                //         }
                //         if (user){
                //             // We found a user with this email address.
                //             // Pass the error to the next method.
                //             return next('Email address already in use!');
                //         }
                //         // If we got this far, the email address hasn't been used yet.
                //         // Call next with no arguments when validation is successful.
                //         next();
                //     });
    
                // }
            }
        },
        password : {
            type : DataTypes.TEXT,
            validate : { 
                notEmpty :true,
            }
        },
        publicEthKey : {
            type : DataTypes.TEXT,
            validate : { notEmpty :true }
        }
    });

    User.hook('beforeCreate', function(user, options){
        const salt = bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
            return salt;
        });
        return new Promise((resolve, reject) =>{
            bcrypt.hash(user.password, salt, null, function(err, hash){
                if(err) return next(err);
                user.password = hash;
                return resolve(user, options);
            });
        });
    })
        
       


    return User;

}



