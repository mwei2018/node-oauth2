'use strict';

const AuthRepository = require('../DataAccess/AuthRepository');
const assert = require('assert');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const authRepository = new AuthRepository();
const config = require('../config');

const mapToRegisterUser = (name, email, password) => {
    var hashedPassword = bcrypt.hashSync(password, 8);
    return {
        name: name,
        email: email,
        password: hashedPassword,
        created_date: new Date(),
        updated_date: new Date(),
        admin:true
    };
};



class AuthManager {    

    register(name, email, password) {        
        const note = mapToRegisterUser(name, email, password);
        return new Promise((resolve, reject) => {
            authRepository.register(note)
                .then(result =>{
                    var token = jwt.sign({ id: result.id }, config.secret, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    resolve(token);
                })
                .catch(error => reject(error.message));
        });
    }


    verifyToken(token) {                      
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.secret, function(err, decoded) {
                if (err) 
                    reject({ auth: false, Error: 'Failed to authenticate token.' });
                authRepository.findUserById(decoded.id)
                    .then(
                        user=>{
                            console.log(user);
                            resolve(user);
                        }).catch(error => reject(error.message));                             
            });
        });    
    }

    login(email,password){
       
        assert(email, 'email is required');
        assert(password, 'password is required');

        return new Promise((resolve, reject) => {
            authRepository.login(email)
                .then(user =>{    
                    var passwordIsValid = bcrypt.compareSync(password, user.password); 
               
                    if (!passwordIsValid) resolve({ auth: false, token: null }); 
                    var token = jwt.sign({ id: user.id }, config.secret, {
                        expiresIn: 86400 
                    });
                    resolve(token);
                })
                .catch(error => reject(error.message));
        });
    }
}
module.exports = AuthManager;