import './public/js/db.mjs';
import * as auth from "./public/js/auth.mjs"
import * as wrap from './public/js/wrapped.mjs'

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import session from 'express-session';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';
import dotenv from 'dotenv';
import { jsPDF } from "jspdf";
import { unlink } from 'node:fs';
import passport from 'passport';

dotenv.config()

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


console.log(__dirname)
app.use(express.static(path.join(__dirname, '/public')));

app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.set('view engine', 'hbs');
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

const User = mongoose.model("User");
const Review = mongoose.model('Review');

app.use(passport.initialize());

passport.serializeUser((user, done) => {
  if (!user || !user._id) return done(new Error("Invalid user object"));
  done(null, user._id); // store only user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

app.use(passport.session());

const authRequiredPaths = ['/home/create'];


app.use((req, res, next) => {
    if (authRequiredPaths.includes(req.path)) {
        if (!res.user) {
            res.redirect('/login');
        } else {
            next();
        }
    } else {
        next();
    }
});


app.use((req, res, next) => {
    res.locals.user = req.user; 
    next();
  });

// https://expressjs.com/en/resources/middleware/session.html

function isAuthenticated(req, res, next) {
    if (req.user) next()
    else next('route')
}

app.get('/login', (req, res) => {
    res.render('login');
});


app.get('/postReview', isAuthenticated, (req, res) => {
    res.render('postReview');
});

app.post('/postReview', isAuthenticated, async (req, res) => {

    try {
        const { gameTitle, rating, platform, developer, hours, reviewText } = req.body;
        if (!gameTitle || !rating || !platform || !reviewText || rating < 1 || rating > 10 || !req.user) {
            return res.status(400).render('postReview', {
                message: "error"
            });
        }
        const newReview = new Review({
            title: sanitize(gameTitle),
            platforms: sanitize(platform),
            developer: sanitize(developer),
            body: sanitize(reviewText),
            score: sanitize(rating),
            time: sanitize(hours),
            author: sanitize(req.user.username),
            date: new Date()
        });

        await newReview.save();

        res.render("savedPage");
    } catch (e) {
        console.error("Error" + e);
        res.status(500).render('postReview', {
            message: 'Error'
        });
    }


});

// app.post('/login', async (req, res) => {
//     try {
//         const user = await auth.login(
//             sanitize(req.body.username),
//             req.body.password
//         );
//         await auth.startAuthenticatedSession(req, user);
//         res.redirect('/home');
//     } catch (err) {
//         console.log(err);
//         res.render('login');
//     }
// });

app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
  }));
  


app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/home', (req, res) => {
    res.render('home', { user: req.user });
});

app.get('/register', (req, res) => {
    res.render('register');
});

// app.post('/register', async (req, res) => {
//     try {
//         const newUser = await auth.register(
//             sanitize(req.body.username),
//             sanitize(req.body.email),
//             req.body.password,
//         );
//         await auth.startAuthenticatedSession(req, newUser);
//         res.redirect('/');
//     } catch (err) {
//         res.render('register',{message:err});
//     }
// });

app.post('/register', async (req, res) => {
    try {
      const newUser = await auth.register(
        sanitize(req.body.username),
        sanitize(req.body.email),
        req.body.password
      );
      req.login(newUser, (err) => {
        if (err) return res.redirect('/register');
        res.redirect('/');
      });
    } catch (err) {
      res.render('register', { message: err });
    }
  });

app.get('/api/userReviews', isAuthenticated, async (req, res) => {
    try {
        const userReviews = await Review.find({ author: req.user.username });
        res.json(userReviews);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching reviews');
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).send('Reviews error');
    }
});

//https://raw.githack.com/MrRio/jsPDF/master/docs/index.html
app.get('/wrapped',isAuthenticated, async (req,res)=>{
    const doc = new jsPDF();
    const userReviews = await Review.find({ author: req.user.username });
    const name = req.user.username;
    const reviewSummary = wrap.getSummary(userReviews);

    doc.setFontSize(20);
    doc.text("Your reviews wrapped!", 20, 20);

    let yPosition = 40;  
    doc.setFontSize(16);  
    
    doc.text(`Total Reviews: ${reviewSummary.num}`, 20, yPosition);
    yPosition += 10;  
    
    doc.text(`Average Rating: ${reviewSummary.averageRating}`, 20, yPosition);
    yPosition += 10;
    
    doc.text(`Average Length: ${reviewSummary.averageLength}`, 20, yPosition);
    yPosition += 10;
    

    doc.text(`Your most played game was: ${reviewSummary.mostPlayedGame}`, 20, yPosition);
    yPosition += 10;
    

    doc.text(`With this many hours... ${reviewSummary.mostPlayedTime}`, 20, yPosition);
    yPosition += 10;
    
    doc.text(`All games played:`, 20, yPosition);
    yPosition += 10;

    doc.setFontSize(12); 
    doc.text(reviewSummary.games, 20, yPosition);    


    const nameString = name + ".pdf";
    console.log(nameString)
    doc.save(nameString);

    //https://stackoverflow.com/questions/31105846/how-to-send-a-pdf-file-from-node-express-app-to-the-browser
    res.download("./"+nameString);
    
    //https://stackoverflow.com/questions/5315138/node-js-remove-file
    //https://stackoverflow.com/questions/12239731/node-js-express-on-response-event
    //https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback
    res.on('finish',()=>{
        unlink(nameString, (err) => {
            if (err){
                console.log(err);
                throw err;
            } 
            else{
                console.log('Pdf sent and deleted');
            }
          }); 
    })

})


if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.PORT ?? 3000, () => {
    console.log("Server running on port", process.env.PORT ?? 3000);
  });
}

export {app};