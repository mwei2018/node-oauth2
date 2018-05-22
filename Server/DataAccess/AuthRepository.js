'use strict';

const ObjectID = require('mongodb').ObjectID;
const DbConnection = require('./DbConnection');
const config = require('../config');

const collection = 'users';

const connect = () => new DbConnection(config.connect);

const filters = {
    id: (id) => {
        return { _id: new ObjectID(id) };
    },   
    email: (email) => {
        return { 'email': { $regex: new RegExp(email, 'i') } };
    }
};
class AuthRepository {
    register(user) {
        const connection = connect();

        return new Promise((resolve, reject) => {
            connection.open().then(() => {
                connection.Db.collection(collection)
                    .findOne(filters.email(user.email))
                    .then(noteData => {
                        if (noteData) {
                            connection.close();
                            reject(Error('Note already exists'));
                        } else {
                            connection.Db
                                .collection(collection)
                                .insertOne(user)
                                .then(result => {
                                    connection.close();
                                    resolve({ id: result.insertedId });
                                })
                                .catch(error => {
                                    connection.close();
                                    reject(error);
                                });
                        }
                    })
                    .catch(error => {
                        connection.close();
                        reject(error);
                    });
            })
                .catch(error => {
                    reject(error);
                    connection.close();
                });
        });
    }

    login(email){      
        const connection = connect();
    
        return new Promise((resolve, reject) => {
            connection
                .open()
                .then(() => {
                    connection.Db.collection(collection)
                        .findOne(filters.email(email))
                        .then(user => {
                            if (!user) {
                                connection.close();
                                reject(Error('No user found.'));
                            } else {
                                resolve(user);
                                connection.close();
                            }
                        })
                        .catch(error => {
                            reject(error);
                            connection.close();
                        });
                })
                .catch(error => {
                    reject(error);
                    connection.close();
                });
        });
    }     

    findUserById(id) {
        const connection = connect();

        return new Promise((resolve, reject) => {
            connection
                .open()
                .then(() => {
                    connection.Db.collection(collection)
                        .findOne(filters.id(id))
                        .then(user => {
                            resolve(user);
                            connection.close();
                        })
                        .catch(error => {
                            reject(error);
                            connection.close();
                        });
                })
                .catch(error => {
                    reject(error);
                    connection.close();
                });
        });
    }
}

module.exports = AuthRepository;