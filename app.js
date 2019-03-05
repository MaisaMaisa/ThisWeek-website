const express = require('express'),
     session = require('express-session'),
     cookieParser = require ('cookie-parser'),
     morgan = require('morgan'),
     path = require('path')
     app = express(),
     port = process.env.PORT || 3001,
     Users = require('./models/users'),
     Posts = require('./models/posts'),
     Comments = require('./models/comments');
     interactjs = require('interactjs');

     

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'views')));



//MIDDLEWARE
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(session({
    name: 'userCookie',
    secret: 'secretSignature'
}));

//NEXT MIDDLEWARE: IS THE USER LOGGED IN OR NOT?
let checkLoggedIn = (req, res, next) => {
    console.log(`this is the usercookie: ${req.cookies.userCookie}`);
    console.log(`this is the user: ${req.session.users}`);
    
    if(req.session.users && req.cookies.userCookie){
        console.log('user was already logged in');
        res.redirect('/loggeduser');
    } else {   
     console.log('checkLoggedIn is a new user so go to');
     next();
    }
}

//RENDER HOMEPAGE
app.get('/', (req, res) => {
    res.render('hommie');
});

//ROUTE REGISTER, (MEANWHILE: CHECK IF THE USER IS LOGGED IN OR NOT), COLLECT INPUT OF USERS TO DB, WHEN THEY REGISTER=> LOGIN 
app.route('/register')
    .get(checkLoggedIn, (req, res) => {
        res.render('register');
    })
    .post((req, res) => {
        console.log('from registration',req.body)
        Users.create({
            user: req.body.name,
            email: req.body.email,
            pass: req.body.pass
        })
        .then((retrievedUser) => {
            req.session.users = retrievedUser.dataValues;
            res.redirect('/login')
        })
        .catch((error) => {
            console.log(`Something went wrong again and again: ${error}`);
            res.redirect('/register');
        });
    });

//IF THE USER IS LOGGING IN, COMPARE THE INPUT DATA WITH DB DATA (RETRIEVED DATA), AND IF IT'S A MATCH, LET THEM IN. IF NOT, TRY AGAIN
app.route('/login')
    .get(checkLoggedIn, (req,res) => {
        res.render('login');
    })
    .post((req, res) => {
        let name = req.body.name,
            pass = req.body.pass;
        console.log(`loging username: ${name}`);
        console.log(`password username: ${pass}`);

        Users.findOne ({
            where: {
                user: name,
                pass: pass
            }
        })
        .then((retrievedUser) => {
            req.session.users = retrievedUser.dataValues;
            res.redirect('/loggeduser');
        })
        .catch((error) => {
            console.log(`something something went wrong: ${error.stack}`);
            res.render('error');
        });
    });

//WHEN SUCCESS IS SUCCESSFUL, THEY ARE IN THE PROFILE
app.get('/loggeduser', (req, res) => {
    if (req.session.users && req.cookies.userCookie) {
        res.render('loggeduser', {
            user: req.session.users.username
        });
    } else {
        res.redirect('/login');
    }
})


//let the user create the form, retrieve and redirect to my posts page with all the user's posts

app.route('/createpost')
    .get((req,res) =>{
        res.render('createpost');
    })
    .post((req, res) => {
        console.log('This is request body:',req.body)
        Posts.create({
            title: req.body.title,
            post: req.body.post,
            userId: req.session.users.id
    })
    res.redirect('/myposts')
    })

//read only the specific posts from the logged in user----> now working 
app.get('/myposts',(req, res) => {
    Promise.all([
        Posts.findAll({
            include: [Comments],
            where: {
                userId : req.session.users.id
            }
        }).then((resultPost) => {
            //console.log('this is the result', resultPost);
            res.render('myposts', {
                content: resultPost
            });
        }).catch((error) => {
            console.log(`Not cool: ${error.stack}`);
        })
    ])     
});


//POST ROUTE FOR MY COMMENTS
app.post('/myposts', (req, res) => {
    Comments.create({
       body: req.body.Body,
       postId: parseInt(req.body.postId),
       userId: req.session.users.id
   }).then((retrievedComments) => {
       Comments.findAll({
           where: {
               postId: retrievedComments.postId
           }
       }).then((allFoundCommentsArray) => {
        console.log('All comments',allFoundCommentsArray);
        res.send(allFoundCommentsArray.dataValues);
        res.redirect('myposts')
           }).catch((error) => {
               console.log(`Something went wrong ${error.stack}`);
               res.redirect('/loggeduser')
           })
       }).catch((error) => {
           console.log(`Something went wrong ${error.stack}`);
           res.redirect('/loggeduser')
       })
   });

//read all posts from all users in ALLPOSTS page
app.get('/allposts', (req, res) => {
    Promise.all([

        Posts.findAll({
            include: [Comments]
        }).then((entities) => {
            res.render('allposts',{
                content: entities,
            }); 
        }).catch((error) => {
            console.log(`Not cool: ${error.stack}`);
    }) 
    ])
});


//making comments for all posts
app.post('/allposts', (req, res) => {
    console.log(req.body);
 Comments.create({
    body: req.body.Body,
    postId: parseInt(req.body.postId),
    userId: req.session.users.id
}).then((retrievedComments) => {
    Comments.findAll({
        where: {
            postId: retrievedComments.postId,
            userId : req.session.users.id
        }
    }).then((allFoundCommentsArray) => {
        res.send(allFoundCommentsArray.dataValues);
        res.redirect('allposts')
        }).catch((error) => {
            console.log(`Something went wrong ${error.stack}`);
            res.redirect('/loggeduser')
        })

        }).catch((error) => {
            console.log(`Something went wrong ${error.stack}`);
            res.redirect('/loggeduser')
        })
    });

//IF THE USER LOGS OUT, THE USER GOES BACK TO HOMMIE'S PAGE
    app.get('/logout', (req, res) => {
        if(req.session.users && req.cookies.userCookie) {
            res.clearCookie('userCookie');
            console.log('COOKIE DELETED');
            res.redirect('/login');
        } else {
            res.redirect('/login');
        }
    }) 

app.listen(port, () => console.log(`ears on ${port}!`));