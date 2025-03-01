const fs = require('fs').promises;
const path = require('path');
const { logger } = require('./logger');

/**
 * Read ER diagram file content
 * @returns {Promise<string>} - ER diagram content
 */
const readERDiagram = async () => {
    try {
        const filePath = path.join(__dirname, '..', 'erDiagram');
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        logger.error('Error reading ER diagram file:', error);
        throw new Error('Failed to read ER diagram file');
    }
};

module.exports = {
    readERDiagram
};
