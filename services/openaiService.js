const OpenAI = require("openai");
const config = require('../config');
const { logger } = require('../utils/logger');
const { readERDiagram } = require('../utils/fileHelpers');

// Initialize OpenAI client
const openai = new OpenAI();

// Base system message for database conversation without the ER diagram
const DATABASE_CONVERSATION_BASE = `Você é um assistente de IA com capacidades de acesso a banco de dados. Sua tarefa é ajudar os usuários a interagir com um banco de dados contendo dados de gerenciamento de projetos. O banco de dados segue este diagrama entidade-relacionamento:

{ER_DIAGRAM}

REGRAS PARA INTERAÇÃO:

1. Se você precisar consultar o banco de dados, inicie sua resposta com "SQL:" seguido por uma consulta SQL válida. Exemplo:
   SQL: SELECT * FROM projetos WHERE data_inicio > '2023-01-01';

2. Se você precisar responder diretamente ao usuário, inicie sua resposta com "USER:" seguido por sua mensagem. Exemplo:
   USER: Com base em seus projetos, você tem 3 pagamentos programados para a próxima semana.

3. Mantenha suas consultas SQL simples e focadas em recuperar apenas as informações necessárias.

4. Formate valores monetários como Real Brasileiro (R$) com vírgula como separador decimal e ponto para milhares.

5. Formate datas no formato brasileiro (DD/MM/AAAA).

6. Você pode receber respostas do banco de dados em formato JSON. Use essas informações para fornecer insights úteis ao usuário.

7. Você pode sugerir ações com base nos dados, como pagamentos que devem ser feitos em breve ou projetos que estão acima do orçamento.

Lembre-se, seu objetivo é ajudar os usuários a entender seus dados de gerenciamento de projetos e tomar decisões informadas.`;

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

/**
 * Gets the complete system message with the current ER diagram
 * @returns {Promise<string>} - Complete system message
 */
const getDatabaseSystemMessage = async () => {
    try {
        const erDiagram = await readERDiagram();
        return DATABASE_CONVERSATION_BASE.replace('{ER_DIAGRAM}', erDiagram);
    } catch (error) {
        logger.error('Error loading ER diagram:', error);
        throw new Error(`Failed to load ER diagram: ${error.message}`);
    }
};

/**
 * Creates a specialized conversation for database interactions
 * 
 * @param {Array} messages - Array of conversation messages
 * @returns {Promise<string>} - Assistant's reply
 */
const createAIDatabaseConversation = async (messages) => {
    // Create a copy of messages to avoid modifying the original array
    const conversationMessages = [...messages];
    
    // Add system message at the beginning if not already present
    if (conversationMessages.length === 0 || conversationMessages[0].role !== 'system') {
        const systemMessage = await getDatabaseSystemMessage();
        conversationMessages.unshift({ 
            role: 'system', 
            content: systemMessage
        });
    }
    
    try {
        const response = await openai.chat.completions.create({
            model: config.openai.model,
            messages: conversationMessages,
        });
        
        return response.choices[0].message.content;
    } catch (error) {
        logger.error('OpenAI API Error:', error.response?.error || error.message);
        throw new Error(`Failed to get database conversation from OpenAI: ${error.message}`);
    }
};

module.exports = {
    createChatCompletion,
    createAIDatabaseConversation
};
