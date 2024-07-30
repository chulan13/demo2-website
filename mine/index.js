// const { MongoClient } = require("mongodb");

const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');
const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
var genuuid=require('uuid');// '/v4' for version 4
const flash = require('connect-flash');

//register and login shit
// const cors = require("cors");
// const cookieSession = require("cookie-session");
mongoose.connect("mongodb+srv://sveethuu:LdR7KyynEjbNwFy3@cluster0.unoyisx.mongodb.net/test?retryWrites=true&w=majority", 
{useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('mongoose.connected');
})
.catch((e) => {
    console.log('fuck you');
    console.log(e.reason);
})

const LogInCollection = require("./mongo");

const app = express();

app.use(flash());

// Use session middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    genid: function(req) {
        console.log('session id is created');
    },
    secret: 'Our little secret.',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, expires: 60000 }
}));

app.use(bodyParser.json());

// Set up Passport
app.use(passport.initialize());
app.use(passport.session());
// const strategy = new LocalStrategy(LogInCollection.authenticate())
// passport.use(strategy);

passport.use(new LocalStrategy(
    // {   usernameField: 'name',
    //     passwordField: 'password',
        { passReqToCallback : true },
    function(name, password, done) {
        try { 
            // Find the user by username in the database 
            const user = LogInCollection.findOne({ name }); 
            // If the user does not exist, return an error 
            if (!user) { 
                return done(null, false, { error: "Incorrect username" }); 
            } 
  
            // Compare the provided password with the  
            // hashed password in the database 
            const passwordsMatch = bcrypt.compare( 
                password, 
                user.password 
            ); 
  
            // If the passwords match, return the user object 
            if (passwordsMatch) { 
                return done(null, user); 
            } else { 
                // If the passwords don't match, return an error 
                return done(null, false, { error: "Incorrect password" }); 
            } 
        } catch (err) { 
            return done(e)
        } 
    }
  ));

passport.serializeUser(LogInCollection.serializeUser());
passport.deserializeUser(LogInCollection.deserializeUser());



app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

fs.readFile('scripts/main.js', (error, content) => {
    console.log(content);
});

fs.readFile('scripts/navbar.js', (error, content) => {
    console.log(content);
});

app.post('/register', async (req, res) => {
    // var data = ({
    //     name:req.body.name,
    //     password:req.body.password
    // })
    const { name, password } = req.body;
   try{
        if (!name && !password) {
            throw new Error('Заповніть усі поля');
        }
        else{
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newUser = new LogInCollection({name, password: hashedPassword})
            await newUser.save();
            res.redirect('/login');
        }
   }
   catch (e) {
        console.log(e)
   }
})

// User login route 
// app.post( 
//     "/login", 
//     passport.authenticate("local", { session: false }), 
//     (req, res) => { 
//         req.session.name = req.body.username; 
//         req.session.save(function(err) {
//             // session saved
//             res.redirect('/')
//         })
//     } 
// ); 

app.post('/login', passport.authenticate('local', { successRedirect: '/index', failureRedirect: '/community-rules', failureFlash: true }), async (req, res) => {
    // var data = new LogInCollection({
    //     name:req.body.name,
    //     password:req.body.password
    // })
    // const { name, password } = req.body;
    // try {
    //     const check = await LogInCollection.findOne({ name: req.body.name })
    //     const passwordMatch = await bcrypt.compare(password, check.password)
        
    //     if (check && passwordMatch) {
    //         res.redirect('/index');
    //     }
    //     else {
    //         res.redirect('/signup');
    //     }
    // }
    // catch (e) {
    //     console.log(e)
    // }
    console.log(req.user);
        req.session.name = req.body.name; 
        req.session(req.session.name);
        req.session.save(function(err) {
            console.log('User logged in:', req.user.name);
            // session saved
            res.redirect('/')
    })
})


app.get('/register', (req, res) => {
    res.render('pages/register');
});

app.get('/login', (req, res) => {
    res.render('pages/login');
});


app.get(['/', '/index'], (req, res) => {
    if (req.isAuthenticated()) {
        res.render('pages/index');
    } else {
        res.send('fuck-you');
    }
});

app.get('/community-rules', (req, res) => {
    res.render('pages/community-rules');
});


app.listen(3500, () => {
    console.log('Server started on port 3500');
});

   