const jwt = require('jsonwebtoken');

const { Exercise } = require('../models/Exercise');
const User = require('../models/User');
const { Workout, WorkoutExerciseTypeOne, WorkoutExerciseTypeTwo, WorkoutExerciseTypeThree } = require('../models/Workout');
const { Routine, ExerciseTypeOne, ExerciseTypeTwo, ExerciseTypeThree } = require('../models/Routines');

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
const getFeed = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const user = await getUserFromToken(token);
  try {
    const userData = await User.findById(user);
    const totalworkoutsdone = await Workout.countDocuments({ userId: userData._id });
    const workout_ids = await Workout.find({ userId: userData._id });
    const workout_dates = await Workout.find({ userId: userData._id }).sort({ date: -1 });
    let totaldistance = 0;
    for (let i = 0; i < workout_ids.length; i++) {
      const workout = await Workout.findById(workout_ids[i]._id);
      const exercises = await WorkoutExerciseTypeTwo.find({ workout_id: workout._id });
      for (let j = 0; j < exercises.length; j++) {
        totaldistance += parseFloat(exercises[j].km);
      }
    }
    let muscleCount = [
      { name: "abductors", value: 0 },
      { name: "abs", value: 0 },
      { name: "adductors", value: 0 },
      { name: "biceps", value: 0 },
      { name: "calves", value: 0 },
      { name: "delts", value: 0 },
      { name: "forearms", value: 0 },
      { name: "glutes", value: 0 },
      { name: "hamstrings", value: 0 },
      { name: "lats", value: 0 },
      { name: "levator scapulae", value: 0 },
      { name: "pectorals", value: 0 },
      { name: "quads", value: 0 },
      { name: "serratus anterior", value: 0 },
      { name: "traps", value: 0 },
      { name: "triceps", value: 0 },
      { name: "upper back", value: 0 }
    ]
    for (let i = 0; i < workout_ids.length; i++) {
      const workout = await Workout.findById(workout_ids[i]._id);
      const exerciseone = await WorkoutExerciseTypeOne.find({ workout_id: workout._id });
      const exercisetwo = await WorkoutExerciseTypeTwo.find({ workout_id: workout._id });
      const exercisethree = await WorkoutExerciseTypeThree.find({ workout_id: workout._id });
      const exercises = [...exercisetwo, ...exerciseone, ...exercisethree];

      for (let j = 0; j < exercises.length; j++) {
        let exercise;
        if (exercises[j].workout_id.toString() === workout._id.toString()) {
          if (exercises[j] instanceof WorkoutExerciseTypeOne) {
            exercise = await Exercise.findById(exercises[j].exercise_id);
          } else if (exercises[j] instanceof WorkoutExerciseTypeTwo) {
            exercise = await Exercise.findById(exercises[j].exercise_id);
          } else if (exercises[j] instanceof WorkoutExerciseTypeThree) {
            exercise = await Exercise.findById(exercises[j].exercise_id);
          }
          if (exercise) {
            const muscleGroup = muscleCount.find(muscle => muscle.name === exercise.target);
            if (muscleGroup) {
              muscleGroup.value += 1;
            }
          }
        }
      }

    }   
    res.status(200).json({ user: userData.username, totalworkoutscount: totalworkoutsdone, totaldistance: totaldistance, muscleCount: muscleCount, workout_dates: workout_dates });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getFeed
};