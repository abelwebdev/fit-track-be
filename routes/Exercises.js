const express = require('express');
const { getAllExercises, getExercise, getFilteredExercises } = require('../controllers/Exercises.js'); 
const router = express.Router();

router.get('/getallexercises', getAllExercises);
router.post('/getexercise', getExercise);
router.post('/getfilteredexercises', getFilteredExercises);


module.exports = router;
