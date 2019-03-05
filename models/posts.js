 const Sequelize = require('sequelize');
 const Comments = require('./comments');

//setting up sequelize connection with database

const allposts =  new Sequelize('digitalpersona', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres',
    operatorsAliases: false,
});

//check if connected
allposts
    .authenticate()
    .then(() => {
        console.error('Congrats');
    }).catch(err => {
        console.error(`Nope: ${error.stack}`)
    });

//define Posts model
const Posts = allposts.define('posts', {
    title: Sequelize.STRING,
    post: Sequelize.TEXT
});
Posts.hasMany(Comments);
Comments.belongsTo(Posts);

allposts.sync()
.then(() => {
    console.log('table posts has been created');
}, (error) => {
    console.log(`error: ${error.stack}`);
});

module.exports = Posts;