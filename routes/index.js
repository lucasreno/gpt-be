const express = require('express');
const router = express.Router();
const conversationRoutes = require('./conversationRoutes');

// Define routes
router.get('/status', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Use route modules
router.use('/conversation', conversationRoutes);

module.exports = router;
