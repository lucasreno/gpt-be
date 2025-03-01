const mysql = require('mysql2/promise');
const config = require('../config');
const { logger } = require('../utils/logger');

let pool;

/**
 * Connect to database and create it if it doesn't exist
 */
const connectDatabase = async () => {
    try {
        // First connect without database to create it if needed
        const initialPool = mysql.createPool({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            waitForConnections: true,
            connectionLimit: config.database.connectionLimit,
            queueLimit: 0,
        });

        await initialPool.query(`CREATE DATABASE IF NOT EXISTS \`${config.database.name}\``);
        logger.info(`Database "${config.database.name}" ready`);
        
        await initialPool.end();

        // Connect with database selected
        pool = mysql.createPool({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            database: config.database.name,
            waitForConnections: true,
            connectionLimit: config.database.connectionLimit,
            queueLimit: 0,
        });

        // Verify connection
        const connection = await pool.getConnection();
        connection.release();
        logger.info('Database connection established successfully');
        
        return pool;
    } catch (error) {
        logger.error('Failed to connect to database:', error);
        throw error;
    }
};

/**
 * Execute SQL query with proper error handling
 */
const executeQuery = async (query) => {
    if (!query) {
        throw new Error('Query parameter is required');
    }

    try {
        if (query.includes(';')) {
            const queries = query.split(';')
                .map(q => q.trim())
                .filter(q => q.length > 0);
            
            const results = [];
            for (const q of queries) {
                const [result] = await pool.query(q);
                results.push(result);
            }
            return results;
        } else {
            const [results] = await pool.query(query);
            return results;
        }
    } catch (error) {
        logger.error(`Query execution failed: ${error.message}`);
        throw error;
    }
};

/**
 * Get the database connection pool
 */
const getPool = () => pool;

module.exports = {
    connectDatabase,
    executeQuery,
    getPool
};
