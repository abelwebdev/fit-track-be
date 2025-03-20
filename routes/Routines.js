const express = require('express');
const { getRoutines, getRoutineExercises, viewRoutine, addRoutines, deleteRoutine, createRoutineFolder, getFolderRoutines, renameFolder, deleteFolder } = require('../controllers/Routines.js'); 
const router = express.Router();

router.post('/getroutines', getRoutines);
router.post('/getroutineexercises', getRoutineExercises);
router.post('/viewroutine', viewRoutine);
router.post('/addroutines', addRoutines);
router.post('/deleteroutine', deleteRoutine);
router.post('/getfolderroutines', getFolderRoutines);
router.post('/createroutinefolder', createRoutineFolder);
router.post('/renamefolder', renameFolder);
router.post('/deletefolder', deleteFolder);


module.exports = router;