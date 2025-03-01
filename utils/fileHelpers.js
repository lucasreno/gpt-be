const fs = require('fs').promises;
const path = require('path');
const { logger } = require('./logger');

/**
 * Read the ER diagram file
 * @returns {Promise<string>} - Content of the ER diagram
 */
const readERDiagram = async () => {
    try {
        const erDiagramPath = path.join(__dirname, '..', 'erDiagram');
        const content = await fs.readFile(erDiagramPath, 'utf8');
        return content;
    } catch (error) {
        logger.error(`Failed to read ER diagram file: ${error.message}`);
        throw new Error(`ER diagram file not found or inaccessible: ${error.message}`);
    }
};

module.exports = {
    readERDiagram
};
