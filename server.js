require('dotenv').config();
const express = require('express');
const { connectDatabase, executeQuery } = require('./db/database');
const { syncDatabaseStructure } = require('./services/dbSyncService');
const { readERDiagram } = require('./utils/fileHelpers');
const { logger } = require('./utils/logger');
const config = require('./config');

// Import routes
const apiRoutes = require('./routes');

const app = express();
const PORT = config.port;

// Middleware
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Basic health check route
app.get('/', (req, res) => {
    res.status(200).json({ status: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500
        }
    });
});

/**
 * Setup database by syncing structure with ER diagram
 */
const setupDatabase = async () => {
    try {
        const erDiagram = await readERDiagram();
        await syncDatabaseStructure(erDiagram);
        logger.info('Database structure synchronized successfully');
    } catch (error) {
        logger.error('Failed to set up database:', error);
        throw error;
    }
};

/**
 * Main application initialization function
 */
const initializeApp = async () => {
    try {
        // Connect to database
        await connectDatabase();
        
        // Set up database structure
        await setupDatabase();
        
        // Start the server
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to initialize application:', error);
        process.exit(1);
    }
};

// Start the application
initializeApp();
