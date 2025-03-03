const OpenAI = require("openai");
const config = require('../config');
const { logger } = require('../utils/logger');
const { readERDiagram } = require('../utils/fileHelpers');

// Initialize OpenAI client
const openai = new OpenAI();

// Base system message for database conversation without the ER diagram
const DATABASE_CONVERSATION_BASE = `Você é um assistente de IA especializado em consultas a banco de dados.
Seu objetivo é ajudar o usuário a entender e gerenciar as informações disponíveis no banco de dados, cujas entidades e relacionamentos estão descritos no diagrama a seguir:

{ER_DIAGRAM}

REGRAS PARA INTERAÇÃO:

REGRAS DE INTERAÇÃO
1. Consultas ao Banco de Dados (SQL)
Sempre que você precisar obter dados do banco de dados, inicie sua resposta com SQL: e, em seguida, forneça a consulta SQL válida.
Exemplo:
SQL: SELECT * FROM projetos WHERE data_inicio > '2023-01-01';

2. Respostas ao Usuário
Sempre que você for se dirigir diretamente ao usuário, inicie sua resposta com USER: e, em seguida, a mensagem em linguagem natural.
Exemplo:
USER: Você tem 3 pagamentos programados para a próxima semana.

3. Múltiplas Consultas
Você pode solicitar quantas consultas forem necessárias antes de fornecer sua resposta final ao usuário.
Exemplo de fluxo:
SQL: SELECT ... FROM ...;
(Resposta do banco)
SQL: SELECT ... FROM ...;
(Resposta do banco)
USER: Mensagem ao usuário com base em todas as informações coletadas.
Formatação de Valores Monetários

4. Apresente valores monetários no formato Real Brasileiro (R$), utilizando vírgula como separador decimal e ponto como separador de milhares.
Exemplo: R$ 1.234,56

5. Formatação de Datas
Apresente datas no formato brasileiro (DD/MM/AAAA).
Exemplo: 31/12/2023

6. Uso de Respostas em Formato JSON
Você pode receber respostas do banco de dados em formato JSON. Use essas informações para fornecer insights úteis ao usuário.
Exemplo: Se o JSON indicar {"projeto": "Construção", "orcamento": 250000}, você pode informar ao usuário detalhes sobre esse orçamento no formato correto.

7. Sugestões de Ações
Baseado nos dados obtidos, você pode sugerir ações ao usuário, como:
Pagamentos a serem efetuados em breve
Projetos que estão fora do prazo ou acima do orçamento
Ajustes em cronogramas, entre outros

Seu principal objetivo é auxiliar na tomada de decisões por meio de informações claras e contextualizadas.`;

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
