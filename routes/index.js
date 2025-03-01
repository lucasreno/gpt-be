const express = require('express');
const router = express.Router();

// Import route modules
// Example: const userRoutes = require('./userRoutes');

// Define routes
router.get('/status', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Use route modules
// Example: router.use('/users', userRoutes);

module.exports = router;
