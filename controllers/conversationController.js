const { processConversation } = require('../services/conversationService');
const { logger } = require('../utils/logger');

/**
 * Handle a new message in the conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleMessage = async (req, res, next) => {
    try {
        const { message, conversation } = req.body;
        
        if (!message && !conversation) {
            return res.status(400).json({ error: 'Message or conversation history required' });
        }
        
        const result = await processConversation(message, conversation || []);
        
        return res.status(200).json({ conversation: result });
    } catch (error) {
        logger.error('Error handling conversation message:', error);
        next(error);
    }
};

/**
 * Start a new conversation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const startConversation = async (req, res, next) => {
    try {
        const result = await processConversation('Olá, como posso ajudar com seus projetos hoje?', []);
        
        return res.status(200).json({ conversation: result });
    } catch (error) {
        logger.error('Error starting conversation:', error);
        next(error);
    }
};

module.exports = {
    handleMessage,
    startConversation
};
