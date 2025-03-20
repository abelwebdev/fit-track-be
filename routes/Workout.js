const express = require('express');
const { TrackRoutineWorkout, getworkoutlog, getsingleworkoutlog, deleteworkoutlog, editworkoutlog } = require('../controllers/Workout.js'); 
const router = express.Router();

router.post('/trackroutineworkout', TrackRoutineWorkout);
router.post('/getworkoutlog', getworkoutlog);
router.post('/getsingleworkoutlog', getsingleworkoutlog);
router.post('/deleteworkoutlog', deleteworkoutlog);
router.post('/editworkoutlog', editworkoutlog);

module.exports = router;