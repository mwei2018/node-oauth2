'use strict';

// package references
const express = require('express');
const UtilHelp = require('../common/util');
// app references
const AuthManager = require('../ServicesLayer/AuthManager');

// initialization
const authManager = new AuthManager();
const util = new UtilHelp();

const authRouter = () => {
    const router = express.Router();
    router
        .post('/register', (request, response) => {//x-www-form-urlencoded
            console.log(request.body);
            const { name, email, password } = request.body;       

            if (!email||!name||!password) {
                response.status(400).send('acount is required');
            } else {
                authManager
                    .register(name, email, password)
                    .then(token => response.status(201).send({ token: token }))
                    .catch(error => {
                        console.log(error);
                        response.status(500).send(error);
                    });
            }
        }).get('/verify', function(request, response) {   

            var token = util.getToken(request.headers)
            if (!token)  return response.status(403).send({ auth: false, message: 'No token provided.' });
          
            authManager.verifyToken(token).then(user =>{              
                if (!user) return response.status(404).send({ auth: false, message: 'No user found.' });    
                response.status(200).send(user);
            }).catch(error => {
                console.log(error.message);
                response.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
            });
           
        }).post('/login', function(request, response) {
            const { email, password } = request.body; 
            if (!email||!password) {
                response.status(400).send('acount is required');
            } else{
                authManager
                    .login(email, password)
                    .then(token => response.status(201).send({token:token}))
                    .catch(error => {
                        console.log(error);
                        response.status(500).send(error);
                    });
            }
        }).get('/logout', function(req, res) {
            res.status(200).send({ auth: false, token: null });
        });

    return router;       
};
module.exports = authRouter;