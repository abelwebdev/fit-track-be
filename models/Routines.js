const mongoose = require('mongoose');

const RoutineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ExerciseTypeOneSchema = new mongoose.Schema({
  routine_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Routine' }],
  exercise_id: { type: String, default: "" },
  order: { type: Number, default: "" },
  setIndex: { type: Number, default: 0 },
  rest_timer: { type: String, default: "00:00" },
  set: { type: String, default: "Normal" },
  kg: { type: String, default: "0" },
  reps: { type: String, default: "0" },
});

const ExerciseTypeTwoSchema = new mongoose.Schema({
  routine_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Routine' }],
  exercise_id: { type: String, default: "" },
  order: { type: Number, default: "" },
  setIndex: { type: Number, default: 0 },
  rest_timer: { type: String, default: "00:00" },
  set: { type: String, default: "Normal" },
  km: { type: String, default: "0.0" },
  time: { type: String, default: "00:00" },
});

const ExerciseTypeThreeSchema = new mongoose.Schema({
  routine_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Routine' }],
  exercise_id: { type: String, default: "" },
  order: { type: Number, default: "" },
  setIndex: { type: Number, default: 0 },
  rest_timer: { type: String, default: "00:00" },
  set: { type: String, default: "Normal" },
  reps: { type: String, default: "0" },
});

module.exports = {
  Routine: mongoose.model('Routine', RoutineSchema),
  ExerciseTypeOne: mongoose.model('ExerciseTypeOne', ExerciseTypeOneSchema),
  ExerciseTypeTwo: mongoose.model('ExerciseTypeTwo', ExerciseTypeTwoSchema),
  ExerciseTypeThree: mongoose.model('ExerciseTypeThree', ExerciseTypeThreeSchema),
};