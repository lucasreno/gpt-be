const { executeQuery } = require('../db/database');
const { createAIDatabaseConversation } = require('./openaiService');
const { logger } = require('../utils/logger');

/**
 * Process a user message and generate a response that may include database interactions
 * @param {string} userMessage - The message from the user
 * @param {Array} conversationHistory - Previous conversation messages
 * @returns {Promise<Object>} - Updated conversation history
 */
const processConversation = async (userMessage, conversationHistory = []) => {
    try {
        // Add user message to history only if it's not null
        if (userMessage) {
            // Check if this message isn't already the last user message
            if (!conversationHistory.length || 
                conversationHistory[conversationHistory.length - 1].role !== 'user' || 
                conversationHistory[conversationHistory.length - 1].content !== userMessage) {
                conversationHistory.push({ role: 'user', content: userMessage });
            }
        }

        // Only proceed if we have at least one message in the history
        if (conversationHistory.length === 0) {
            return conversationHistory;
        }

        // Get AI response
        const aiResponse = await createAIDatabaseConversation(conversationHistory);
        
        // Process the AI response
        if (aiResponse.startsWith('SQL:')) {
            // Extract SQL query
            const sqlQuery = aiResponse.replace('SQL:', '').trim();
            logger.info(`Executing SQL query: ${sqlQuery}`);
            
            try {
                // Execute the SQL query
                const results = await executeQuery(sqlQuery);
                
                // Add the SQL query to conversation history
                conversationHistory.push({ role: 'assistant', content: aiResponse });
                
                // Add the database response to conversation history
                conversationHistory.push({ 
                    role: 'system', 
                    content: `Backend: ${JSON.stringify(results, null, 2)}`
                });
                
                // Let the AI interpret the results without adding a new user message
                // We're passing the updated conversation history directly
                return await processConversation(null, conversationHistory);
                
            } catch (error) {
                logger.error(`SQL execution error: ${error.message}`);
                
                // Add the SQL error to conversation history
                conversationHistory.push({ role: 'assistant', content: aiResponse });
                conversationHistory.push({ 
                    role: 'system', 
                    content: `Backend Error: ${error.message}`
                });
                
                // Let the AI handle the error without adding a new user message
                return await processConversation(null, conversationHistory);
            }
        } else if (aiResponse.startsWith('USER:')) {
            // This is a message for the user
            conversationHistory.push({ role: 'assistant', content: aiResponse });
            return conversationHistory;
        } else {
            // Default handling for other responses
            conversationHistory.push({ role: 'assistant', content: aiResponse });
            return conversationHistory;
        }
    } catch (error) {
        logger.error('Error in conversation processing:', error);
        throw error;
    }
};

module.exports = {
    processConversation
};
