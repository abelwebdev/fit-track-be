const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  equipment: {
    type: String,
    required: true
  },
  bodypart: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  secondary: [{
    type: String,
    required: true
  }],
  gifurl: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  },
  exercise_id: {
    type: String,
    required: true,
    unique: true
  }
});


module.exports = {
  Exercise: mongoose.model('Exercise', ExerciseSchema)
}