const jwt = require('jsonwebtoken');

const { Exercise } = require('../models/Exercise');
const User = require('../models/User');
const { Folder } = require("../models/RoutineFolder");
const { Routine, ExerciseTypeOne, ExerciseTypeTwo, ExerciseTypeThree } = require('../models/Routines');
const RoutineFolder = require('../models/RoutineFolder');

const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user._id.toString();
  } catch (error) {
    throw new Error('Invalid token or user not found');
  }
};
const getRoutines = async (req, res) => {

  // const token = req.headers.authorization.split(" ")[1];
  // const user = await getUserFromToken(token);
  // try {
  //   try {
  //     const routines = await Routine.find({ userId: user, folderId: null });
  //     const folderroutines = await Folder.find({ userId: user });
  //     res.status(200).json({ routine: routines, folderroutine: folderroutines});
  //   } catch (err) {
  //     res.status(500).json({ error: err }); // "Failed to fetch Routine"
  //   }
  // } catch (error) {
  //   res.status(404).json({ message: error.message });
  // }
    try {
      const userId = req.user.id; // Assuming user ID is extracted from authentication middleware
      const standaloneRoutines = await Routine.find({ userId, folderId: null });
      const folders = await Folder.find({ userId });
      const foldersWithRoutines = await Promise.all(
        folders.map(async (folder) => {
          const routines = await Routine.find({ folderId: folder._id });
          return {
            ...folder._doc, // Spread folder details
            routines, // Attach routines
          };
        })
      );
      res.status(200).json({
        success: true,
        routines: standaloneRoutines, // Routines without a folder
        folders: foldersWithRoutines, // Folders with their routines
      });
    } catch (error) {
      console.error("Error fetching routines and folders:", error);
      res.status(500).json({ success: false, message: "Failed to fetch data" });
    }
};
const getRoutineExercises = async (req, res) => {
  const id = req.body.id;
  try {
    const routine = await Routine.findById(id);
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }
    const exercisesTypeOne = await ExerciseTypeOne.find({ routine_id: id });
    const exercisesTypeTwo = await ExerciseTypeTwo.find({ routine_id: id });
    const exercisesTypeThree = await ExerciseTypeThree.find({ routine_id: id });
    // Fetch additional information for each exercise
    const exerciseTypeOneExercises = await Exercise.find({ _id: { $in: exercisesTypeOne.map(r => r.exercise_id) } });
    const exerciseTypeTwoExercises = await Exercise.find({ _id: { $in: exercisesTypeTwo.map(r => r.exercise_id) } });
    const exerciseTypeThreeExercises = await Exercise.find({ _id: { $in: exercisesTypeThree.map(r => r.exercise_id) } });

    res.status(200).json({
      routine,
      ExerciseTypeOne: exercisesTypeOne.map(r => ({
        ...r.toObject(),
        exercise: exerciseTypeOneExercises.find(e => e._id.equals(r.exercise_id))
      })),
      ExerciseTypeTwo: exercisesTypeTwo.map(r => ({
        ...r.toObject(),
        exercise: exerciseTypeTwoExercises.find(e => e._id.equals(r.exercise_id))
      })),
      ExerciseTypeThree: exercisesTypeThree.map(r => ({
        ...r.toObject(),
        exercise: exerciseTypeThreeExercises.find(e => e._id.equals(r.exercise_id))
      }))
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: error.message });
  }
};
const viewRoutine = async (req, res) => {
  const routineId = req.body.routineId;
  try {
    const routine = await Routine.findById(routineId);
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }
    const exercisesTypeOne = await ExerciseTypeOne.find({ routine_id: routineId });
    const exercisesTypeTwo = await ExerciseTypeTwo.find({ routine_id: routineId });
    const exercisesTypeThree = await ExerciseTypeThree.find({ routine_id: routineId });
    // Fetch additional information for each exercise
    const exerciseTypeOneExercises = await Exercise.find({ _id: { $in: exercisesTypeOne.map(r => r.exercise_id) } });
    const exerciseTypeTwoExercises = await Exercise.find({ _id: { $in: exercisesTypeTwo.map(r => r.exercise_id) } });
    const exerciseTypeThreeExercises = await Exercise.find({ _id: { $in: exercisesTypeThree.map(r => r.exercise_id) } });

    res.status(200).json({
      routine,
      ExerciseTypeOne: exercisesTypeOne.map(r => ({
        ...r.toObject(),
        exercise: exerciseTypeOneExercises.find(e => e._id.equals(r.exercise_id))
      })),
      ExerciseTypeTwo: exercisesTypeTwo.map(r => ({
        ...r.toObject(),
        exercise: exerciseTypeTwoExercises.find(e => e._id.equals(r.exercise_id))
      })),
      ExerciseTypeThree: exercisesTypeThree.map(r => ({
        ...r.toObject(),
        exercise: exerciseTypeThreeExercises.find(e => e._id.equals(r.exercise_id))
      }))
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: error.message });
  }
};
const addRoutines = async (req, res) => {
  const routine_title = req.body.title;
  const exercises = req.body.exercises;
  const rest_timers = req.body.restTimers;
  const folder_id = req.body.folderId;
  const token = req.headers.authorization.split(" ")[1];
  const user = await getUserFromToken(token);
  let responseMessages = "";
  const routine = new Routine({
    userId: user,
    title: routine_title,
    folderId: folder_id || null,
  });
  await routine.save();
  // Iterate over each exercise
  for (const exerciseKey in exercises) {
    if (exercises.hasOwnProperty(exerciseKey)) {
      const exercise = exercises[exerciseKey];
      if (exercise.type === 'set_type_1') {
        const ExerciseTypeOneEntries = [];
        // Iterate over each set in the exercise
        for (const setKey in exercise) {
          if (setKey.startsWith('set-')) {
            const set = exercise[setKey];
            const number = setKey.slice(4); // Start slicing after 'set-'
            const numberValue = parseInt(number, 10);
            // Create ExerciseTypeOne entry
            const ExerciseTypeOneEntry = await ExerciseTypeOne.create({
              routine_id: routine._id,
              exercise_id: exercise.exerciseId.id,
              setIndex: numberValue,
              order: exercise.order,
              set: set.setType,
              rest_timer: rest_timers[exercise.exerciseId.id],
              kg: set.kg, // Ensure this field is correctly named
              reps: set.reps,
            });
            ExerciseTypeOneEntries.push(ExerciseTypeOneEntry._id);
          }
        }
        responseMessages = "Successfully created Routine";
      } else if (exercise.type === 'set_type_2') {
        const ExerciseTypeTwoEntries = [];
        // Iterate over each set in the exercise
        for (const setKey in exercise) {
          if (setKey.startsWith('set-')) {
            const set = exercise[setKey];
            const number = setKey.slice(4); // Start slicing after 'set-'
            const numberValue = parseInt(number, 10);
            // Create ExerciseTypeTwo entry
            const ExerciseTypeTwoEntry = await ExerciseTypeTwo.create({
              routine_id: routine._id,
              exercise_id: exercise.exerciseId.id,
              order: exercise.order,
              setIndex: numberValue,
              rest_timer: rest_timers[exercise.exerciseId.id],
              set: set.setType,
              km: set.km,
              time: set.time,
            });
            ExerciseTypeTwoEntries.push(ExerciseTypeTwoEntry._id);
          }
        }
        responseMessages = "Successfully created Routine";
      } else if (exercise.type === 'set_type_3') {
        const ExerciseTypeThreeEntries = [];
        // Iterate over each set in the exercise
        for (const setKey in exercise) {
          if (setKey.startsWith('set-')) {
            const set = exercise[setKey];
            const number = setKey.slice(4); // Start slicing after 'set-'
            const numberValue = parseInt(number, 10);
            // Create ExerciseTypeThree entry
            const ExerciseTypeThreeEntry = await ExerciseTypeThree.create({
              routine_id: routine._id,
              exercise_id: exercise.exerciseId.id,
              order: exercise.order,
              setIndex: numberValue,
              rest_timer: rest_timers[exercise.exerciseId.id],
              set: set.setType,
              reps: set.reps,
            });
            ExerciseTypeThreeEntries.push(ExerciseTypeThreeEntry._id);
          }
        }
      }
      responseMessages = "Successfully created Routine";
    }
  }
  res.status(200).json({ message: responseMessages });
};
const deleteRoutine = async (req, res) => {
  const routineId = req.body.routineId;
  try {
    const routine = await Routine.findById(routineId);
    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }
    const exerciseTypeOne = await ExerciseTypeOne.find({ routine_id: routineId });
    const exerciseTypeTwo = await ExerciseTypeTwo.find({ routine_id: routineId });
    const exerciseTypeThree = await ExerciseTypeThree.find({ routine_id: routineId });
    await exerciseTypeOne.forEach(async (exercise) => {
      await exercise.deleteOne();
    });
    await exerciseTypeTwo.forEach(async (exercise) => {
      await exercise.deleteOne();
    });
    await exerciseTypeThree.forEach(async (exercise) => {
      await exercise.deleteOne();
    });
    await routine.deleteOne();
    res.status(200).json({ message: "Routine deleted successfully" });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: error.message });
  }
};
const createRoutineFolder = async (req, res) => {
  const foldername = req.body.foldername;
  const token = req.headers.authorization.split(" ")[1];
  const user = await getUserFromToken(token);
  const folder = new Folder({
    userId: user,
    title: foldername,
  });
  await folder.save();
  res.status(200).json({ message: "Folder created successfully" });
};
const getFolderRoutines = async (req, res) => {

};
const renameFolder = async (req, res) => {
  const FolderId = req.body.folderId;
  const NewFolderName = req.body.folderName;
  try {
    const folder = await Folder.findById(FolderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    folder.title = NewFolderName;
    await folder.save();
    res.status(200).json({ message: "Folder renamed successfully" });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: error.message });
  }
};
const deleteFolder = async (req, res) => {
  const folderId = req.body.folderId;
  try {
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }
    const folder_id = folder._id;
    const routines = await Routine.find({ folderId: folder_id });
    await routines.forEach(async (routine) => {
      await routine.deleteOne();
    });
    await folder.deleteOne();
    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  getRoutines, getRoutineExercises, viewRoutine, addRoutines, deleteRoutine, createRoutineFolder, getFolderRoutines, renameFolder, deleteFolder
};