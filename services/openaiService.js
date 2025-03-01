const OpenAI = require("openai");
const config = require('../config');
const { logger } = require('../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI();

/**
 * Creates a chat completion using OpenAI API
 * 
 * @param {Array} messages - Array of conversation messages
 * @returns {Promise<string>} - Assistant's reply
 */
const createChatCompletion = async (messages) => {
    try {
        const response = await openai.chat.completions.create({
            model: config.openai.model,
            messages: messages,
        });
        
        const reply = response.choices[0].message.content;
        messages.push({ role: 'assistant', content: reply });
        
        return reply;
    } catch (error) {
        logger.error('OpenAI API Error:', error.response?.error || error.message);
        throw new Error(`Failed to get completion from OpenAI: ${error.message}`);
    }
};

module.exports = {
    createChatCompletion
};
