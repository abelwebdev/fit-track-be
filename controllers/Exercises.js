const { Exercise } = require('../models/Exercise'); // Import the Exercise model

const getAllExercises = async (request, response) => {
  try {
    const { page = 1, limit = 10 } = request.query; // Default to page 1, 10 items per page
    const skip = (page - 1) * limit;
    try {
      // Fetch paginated exercises from the database
      const exercises = await Exercise.find()
        .skip(skip)
        .limit(parseInt(limit));
      const totalExercises = await Exercise.countDocuments(); // Total number of exercises
      response.status(200).json({
        total: totalExercises,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalExercises / limit),
        data: exercises,
      });
    } catch (err) {
      response.status(500).json({ error: "Failed to fetch exercises" });
    }
  } catch (error) {
    // Handle errors and send a 404 response
    response.status(404).json({ message: error.message });
  }
}
const getExercise = async (req, res) => {
  const exerciseId = req.body.exerciseId;
  try {
    const exercise = await Exercise.findOne({ exercise_id: exerciseId });
    if (exercise) {
      res.status(200).json(exercise);
    } else {
      res.status(404).json({ message: 'Exercise not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error });
  }
}
const getFilteredExercises = async (req, res) => {
  const { query, muscle, equipment } = req.body;
  try {
    let exercises = [];
    let filter = {};

    // If query is not empty, add the name filter
    if (query) {
      filter.name = { $regex: query, $options: 'i' };
    }

    // Add the muscle filter if a specific muscle is selected
    if (muscle !== 'All Muscles') {
      filter.target = muscle;
    }

    if (equipment !== 'All Equipments') {
      filter.equipment = equipment;
    }
    exercises = await Exercise.find(filter);

    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error });
  }
}

module.exports = {
  getAllExercises, getExercise, getFilteredExercises
};