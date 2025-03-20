const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  routineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Routine', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

const WorkoutExerciseTypeOneSchema = new mongoose.Schema({
  workout_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
  exercise_id: { type: String, default: "" },
  order: { type: Number, default: "" },
  setIndex: { type: Number, default: "" },
  rest_timer: { type: String, default: "00:00" },
  set: { type: String, default: "Normal" },
  kg: { type: String, default: "0" },
  reps: { type: String, default: "0" },
}); 

const WorkoutExerciseTypeTwoSchema = new mongoose.Schema({
  workout_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
  exercise_id: { type: String, default: "" },
  order: { type: Number, default: "" },
  setIndex: { type: Number, default: "" },
  rest_timer: { type: String, default: "00:00" },
  set: { type: String, default: "Normal" },
  km: { type: String, default: "0.0" },
  time: { type: String, default: "00:00" },
});

const WorkoutExerciseTypeThreeSchema = new mongoose.Schema({
  workout_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
  exercise_id: { type: String, default: "" },
  order: { type: Number, default: "" },
  setIndex: { type: Number, default: "" },
  rest_timer: { type: String, default: "00:00" },
  set: { type: String, default: "Normal" },
  reps: { type: String, default: "0" },
});

module.exports = {
  Workout: mongoose.model('Workout', WorkoutSchema),
  WorkoutExerciseTypeOne: mongoose.model('WorkoutExerciseTypeOne', WorkoutExerciseTypeOneSchema),
  WorkoutExerciseTypeTwo: mongoose.model('WorkoutExerciseTypeTwo', WorkoutExerciseTypeTwoSchema),
  WorkoutExerciseTypeThree: mongoose.model('WorkoutExerciseTypeThree', WorkoutExerciseTypeThreeSchema),
};