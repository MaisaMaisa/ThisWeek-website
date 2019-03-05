const Sequelize = require('sequelize');
const Posts = require('./posts');
const Comments = require('./comments')

//setting up sequelize connection with database

const users =  new Sequelize('digitalpersona', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres',
    operatorsAliases: false,
});

//check if connected
users
    .authenticate()
    .then(() => {
        console.error('Congrats');
    }).catch(err => {
        console.error(`Nope: ${error.stack}`)
    });

//define Users model
const Users = users.define('users', {
    user: Sequelize.TEXT,
    email: Sequelize.TEXT,
    pass: Sequelize.TEXT
});
//connect it to posts database
Users.hasMany(Posts);
Posts.belongsTo(Users);

Users.hasMany(Comments);
Comments.belongsTo(Users);

users.sync()
.then(() => {
    console.log('users has been created');
}, (error) => {
    console.log(`error: ${error.stack}`);
});

module.exports = Users;