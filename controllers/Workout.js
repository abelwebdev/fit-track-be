const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { Exercise } = require("../models/Exercise");
const { Routine } = require('../models/Routines');
const { Workout, WorkoutExerciseTypeOne, WorkoutExerciseTypeTwo, WorkoutExerciseTypeThree } = require('../models/Workout');

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
const TrackRoutineWorkout = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const user = await getUserFromToken(token);
  const { routineId } = req.body;
  const exercises = req.body.exercises;

  const workout = new Workout({
    userId: user,
    routineId: routineId,
  });
  await workout.save();

  for (const exercise of exercises.ExerciseTypeOne) {
    const WorkoutExerciseTypeOneEntries = [];
    const WorkoutExerciseTypeOneEntry = await WorkoutExerciseTypeOne.create({
      workout_id: workout._id,
      exercise_id: exercise.exercise_id,
      order: exercise.order,
      setIndex: exercise.setIndex,
      set: exercise.set,
      rest_timer: exercise.rest_timer,
      kg: exercise.kg, 
      reps: exercise.reps,
    });
    WorkoutExerciseTypeOneEntries.push(WorkoutExerciseTypeOneEntry);
    responseMessages = "Successfully Logged Workout";
  }
  for (const exercise of exercises.ExerciseTypeTwo) {
    const WorkoutExerciseTypeTwoEntries = [];
    const WorkoutExerciseTypeTwoEntry = await WorkoutExerciseTypeTwo.create({
      workout_id: workout._id,
      exercise_id: exercise.exercise_id,
      order: exercise.order,
      setIndex: exercise.setIndex,
      set: exercise.set,
      rest_timer: exercise.rest_timer,
      km: exercise.km, 
      time: exercise.time,
    });
    WorkoutExerciseTypeTwoEntries.push(WorkoutExerciseTypeTwoEntry);
    responseMessages = "Successfully Logged Workout";
  }
  for (const exercise of exercises.ExerciseTypeThree) {
    const WorkoutExerciseTypeThreeEntries = [];
    const WorkoutExerciseTypeThreeEntry = await WorkoutExerciseTypeThree.create({
      workout_id: workout._id,
      exercise_id: exercise.exercise_id,
      order: exercise.order,
      setIndex: exercise.setIndex,
      set: exercise.set,
      rest_timer: exercise.rest_timer,
      reps: exercise.reps,
    });
    WorkoutExerciseTypeThreeEntries.push(WorkoutExerciseTypeThreeEntry);
    responseMessages = "Successfully Logged Workout"
  };
  res.status(200).json({ message: responseMessages });
};
const getworkoutlog = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const user = await getUserFromToken(token);
    const workout = await Workout.find({ userId: user }).sort({ createdAt: -1 });
    const workoutIds = workout.map(item => ({
      workoutId: item._id,
      routineId: item.routineId,
    }));   
    const workoutData = await Promise.all(
      workoutIds.map(async (item) => {
        const workout_id = item.workoutId;
        const routine_id = item.routineId;
        const [routine, workout, createdat] = await Promise.all([
          Routine.findById(routine_id),
          Workout.findById(workout_id),
        ]);
        return [routine, workout];
      })
    );
    res.status(200).json({ workoutData: workoutData });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
};
const getsingleworkoutlog = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const user = await getUserFromToken(token);
    const workout_id = req.body.workoutid;
    const routinevalue = await Workout.findOne({ _id: workout_id });
    const routineId = routinevalue.routineId;
    const routine = await Routine.findOne({ _id: routineId });
    const [workouttypeone, workouttypetwo, workouttypethree] = await Promise.all([
      WorkoutExerciseTypeOne.find({ workout_id: workout_id }),
      WorkoutExerciseTypeTwo.find({ workout_id: workout_id }),
      WorkoutExerciseTypeThree.find({ workout_id: workout_id }),
    ]);
    const fetchExercises = async (workouts, type) => {
      return await Promise.all(
        workouts.map(async (workout) => {
          const exercise = await Exercise.findOne({ _id: workout.exercise_id });
          return { ...workout.toObject(), exerciseDetails: exercise, type: type };
        })
      );
    };
    const workouttypeoneExercise = await fetchExercises(workouttypeone, 'ExerciseTypeOne');
    const workouttypetwoExercise = await fetchExercises(workouttypetwo, 'ExerciseTypeTwo');
    const workouttypethreeExercise = await fetchExercises(workouttypethree, 'ExerciseTypeThree');
    const allWorkouts = [
      ...workouttypeoneExercise,
      ...workouttypetwoExercise,
      ...workouttypethreeExercise,
    ];
    res.status(200).json({ allWorkouts: allWorkouts, routine: routine });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
};
const deleteworkoutlog = async (req, res) => {
  const workoutId = req.body.workoutId;
  try {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    };
    const workouttypeone = await WorkoutExerciseTypeOne.find({ workout_id: workoutId });
    const workouttypetwo = await WorkoutExerciseTypeTwo.find({ workout_id: workoutId });
    const workouttypethree = await WorkoutExerciseTypeThree.find({ workout_id: workoutId });
    const deletePromises = [
      ...workouttypeone.map((workout) => WorkoutExerciseTypeOne.findByIdAndDelete(workout._id)),
      ...workouttypetwo.map((workout) => WorkoutExerciseTypeTwo.findByIdAndDelete(workout._id)),
      ...workouttypethree.map((workout) => WorkoutExerciseTypeThree.findByIdAndDelete(workout._id)),
    ];
    await Promise.all(deletePromises);
    await Workout.findByIdAndDelete(workoutId);
    res.status(200).json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
};
const editworkoutlog = async (req, res) => {
  const { workoutId } = req.body;
  const { updatedTimer, updatedSet, updatedKg, updatedReps, updatedKm, updatedTime } = req.body.payload;
  try {
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    const updatePromises = [];
    if (Object.keys(updatedTimer).length > 0) {
      Object.keys(updatedTimer).forEach(key => {
        const order = key.split('-')[1];
        const exercise = updatedTimer[key];  
        const updatedExerciseOne = WorkoutExerciseTypeOne.findOneAndUpdate(
          { _id: exercise.exercise_id, workout_id: workoutId, order: order },
          { rest_timer: exercise.rest_timer },
          { new: true }
        );
        const updatedExerciseTwo = WorkoutExerciseTypeTwo.findOneAndUpdate(
          { _id: exercise.exercise_id, workout_id: workoutId },
          { rest_timer: exercise.rest_timer },
          { new: true }
        );
        const updatedExerciseThree = WorkoutExerciseTypeThree.findOneAndUpdate(
          { _id: exercise.exercise_id, workout_id: workoutId },
          { rest_timer: exercise.rest_timer },
          { new: true }
        );
        updatePromises.push(updatedExerciseOne);
        updatePromises.push(updatedExerciseTwo);
        updatePromises.push(updatedExerciseThree);
      });
    }
    if (Object.keys(updatedSet).length > 0) {
      Object.keys(updatedSet).forEach(key => {
        const exercise = updatedSet[key];
        const order = key.split('-')[1];
        for (const key in exercise) {
          if (key.startsWith('set-')) {
            const setIndex = key.split('-')[1];
            const updatedExerciseOne = WorkoutExerciseTypeOne.findOneAndUpdate(
              { exercise_id: exercise.exercise_id, workout_id: workoutId, setIndex: setIndex, order: order },
              { set: exercise[key]},
              { new: true }
            );
            const updatedExerciseTwo = WorkoutExerciseTypeTwo.findOneAndUpdate(
              { exercise_id: exercise.exercise_id, workout_id: workoutId, setIndex: setIndex },
              { set: exercise[key]},
              { new: true }
            );
            const updatedExerciseThree = WorkoutExerciseTypeThree.findOneAndUpdate(
              { exercise_id: exercise.exercise_id, workout_id: workoutId, setIndex: setIndex },
              { set: exercise[key]},
              { new: true }
            );
            updatePromises.push(updatedExerciseOne);
            updatePromises.push(updatedExerciseTwo);
            updatePromises.push(updatedExerciseThree);
          }
        }
      });
    }
    if (Object.keys(updatedKg).length > 0) {
      Object.keys(updatedKg).forEach(key => {
        const exercise = updatedKg[key]
        const order = key.split('-')[1];
        for (const key in exercise) {
          if (key.startsWith('set-')) {
            const setIndex = key.split('-')[1];
            const updatedExerciseOne = WorkoutExerciseTypeOne.findOneAndUpdate(
              { exercise_id: exercise.exercise_id, workout_id: workoutId, setIndex: setIndex, order: order },
              { kg: exercise[key]},
              { new: true }
            );
            updatePromises.push(updatedExerciseOne);
          }
        }
      });
    }
    if (Object.keys(updatedReps).length > 0) {
      Object.keys(updatedReps).forEach(key => {
        const exercise = updatedReps[key];
        const order = key.split('-')[1];
        for (const key in exercise) {
          if (key.startsWith('set-')) {
            const setIndex = key.split('-')[1];
            const updatedExerciseOne = WorkoutExerciseTypeOne.findOneAndUpdate(
              { exercise_id: exercise.exercise_id, workout_id: workoutId, setIndex: setIndex, order: order },
              { reps: exercise[key]},
              { new: true }
            );
            const updatedExerciseThree = WorkoutExerciseTypeThree.findOneAndUpdate(
              { exercise_id: exercise.exercise_id, workout_id: workoutId, setIndex: setIndex },
              { reps: exercise[key]},
              { new: true }
            )
            updatePromises.push(updatedExerciseOne);
            updatePromises.push(updatedExerciseThree);
          }
        }
      })
    }
    if (Object.keys(updatedKm).length > 0) {
      Object.keys(updatedKm).forEach(key => {
        const exercise = updatedKm[key];
        const order = key.split('-')[1];
        for (const key in exercise) {
          if (key.startsWith('set-')) {
            const setIndex = key.split('-')[1];
            const updatedExerciseTwo = WorkoutExerciseTypeTwo.findOneAndUpdate(
              { exercise_id: exercise.exercise_id, workout_id: workoutId, setIndex: setIndex },
              { km: exercise[key]},
              { new: true }
            );
            updatePromises.push(updatedExerciseTwo);
          }
        }
      });
    }
    if (Object.keys(updatedTime).length > 0) {
      Object.keys(updatedTime).forEach(key => {
        const exercise = updatedTime[key];
        const order = key.split('-')[1];
        for (const key in exercise) {
          if (key.startsWith('set-')) {
            const setIndex = key.split('-')[1];
            const updatedExerciseTwo = WorkoutExerciseTypeTwo.findOneAndUpdate(
              { exercise_id: exercise.exercise_id, workout_id: workoutId, setIndex: setIndex },
              { time: exercise[key]},
              { new: true }
            );
            updatePromises.push(updatedExerciseTwo);
          }
        }
      });
    }
    try {
      await Promise.all(updatePromises);
      res.status(200).json({ message: 'Workout updated successfully' });
    } catch (error) {
      console.error('Error updating workouts:', error);
      res.status(500).json({ message: 'An error occurred while updating workouts' });
    }
  } catch (error) {
    console.error('Error updating activity log:', error);
    res.status(500).json({ message: 'Something went wrong, please try again!' });
  }
};

module.exports = {
  TrackRoutineWorkout, getworkoutlog, getsingleworkoutlog, deleteworkoutlog, editworkoutlog
};