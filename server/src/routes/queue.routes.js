const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queue.controller');

router.post('/join', queueController.joinQueue);
router.get('/', queueController.getQueue);

module.exports = router;
