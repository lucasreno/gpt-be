const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

// Routes for conversation
router.post('/message', conversationController.handleMessage);
router.post('/start', conversationController.startConversation);

module.exports = router;
