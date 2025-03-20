const express = require('express');
const { getFeed } = require('../controllers/Feed.js'); 
const router = express.Router();

router.post('/getfeed', getFeed);

module.exports = router;