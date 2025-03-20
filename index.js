const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');

const authMiddleware = require('./middlewares/authMiddleware'); // Adjust the path to your middleware 
const authRoutes = require('./routes/auth');
const Exercises = require('./routes/Exercises');
const Routines = require('./routes/Routines');
const Workout = require("./routes/Workout");
const Feed = require("./routes/Feed");

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const app = express();

// Apply Cookie Parser before CORS to handle cookies correctly
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: ['https://fit-track-fe.onrender.com', 'https://fit-trackweb.netlify.app', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Content-Type-Options', 'Accept', 'X-Requested-With', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.options('*', cors(corsOptions));

app.use(cors(corsOptions));


// express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport.js
app.use(passport.initialize());
require('./config/passport')(passport);

app.options('/api', cors(corsOptions));
app.options('/exercises', cors(corsOptions));
app.options('/routines', cors(corsOptions));
app.options('/workout', cors(corsOptions));
app.options('/feed', cors(corsOptions));

// Routes
app.use('/api', authRoutes);  // Public routes
app.use('/exercises', authMiddleware, Exercises);  // Protected routes
app.use('/routines', authMiddleware, Routines);    // Protected routes
app.use('/workout', authMiddleware, Workout);      // Protected routes
app.use('/feed', authMiddleware, Feed);            // Protected routes

// Use the PORT environment variable provided by Render
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});