const Sequelize = require('sequelize');



//setting up sequelize connection with database

const comments =  new Sequelize('digitalpersona', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres',
    operatorsAliases: false,
});

//check if connected
comments
    .authenticate()
    .then(() => {
        console.error('Congrats');
    }).catch(err => {
        console.error(`Nope: ${error.stack}`)
    });

//define Comments model
const Comments = comments.define('comments', {
    body: Sequelize.TEXT
});

comments.sync()
.then(() => {
    console.log('comments has been created');
}, (error) => {
    console.log(`error: ${error.stack}`);
});

module.exports = Comments; 