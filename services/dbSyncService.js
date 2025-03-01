const config = require('../config');
const { executeQuery } = require('../db/database');
const { createChatCompletion } = require('./openaiService');
const { logger } = require('../utils/logger');

const SYSTEM_SYNC = `Você é um especialista em banco de dados e está trabalhando em um projeto para sincronizar a estrutura de um banco de dados MariaDB com base em um diagrama ER.
Seu objetivo é sincronizar a estrutura do banco de dados (MariaDB) de forma segura e eficiente. Para isso, você receberá inicialmente o diagrama ER atualizado e, em seguida, informações sobre a estrutura atual do banco de dados. Siga rigorosamente as regras abaixo:
0. Seria interessante se você iniciar sempre fazendo uma consulta para verificar se a estrutura existe antes de criar ou alterar algo.
1. Preservação de Dados: Considere que o banco pode já conter registros.
2. Respostas Exclusivamente em SQL: Você deve responder apenas com consultas SQL, sem explicações ou comentários.
3. Eficiência e Economia de Tokens: Minimize e compacte as consultas SQL o máximo possível. Solicite e execute apenas o que for estritamente necessário para a sincronização.
4. Avaliação do Estado Atual:
   - Antes de enviar uma nova consulta, analise os resultados das execuções anteriores.
   - Se uma consulta já foi executada ou se o resultado indica que determinada alteração não é mais necessária, não repita a mesma consulta.
5. Processo Iterativo:
   - A cada resposta minha (resultado da execução), atualize sua estratégia de sincronização.
   - Se o resultado indicar que uma consulta anterior já surtiu efeito ou que a estrutura está atualizada, evite enviar comandos redundantes.
6. Encerramento: Quando você tiver certeza de que a estrutura do banco de dados está completamente sincronizada com o diagrama ER, responda com a palavra \`FIM\` para encerrar a conversa.
7. Não adicione markdown ou formatação especial às consultas SQL. Use apenas texto simples.

Lembre-se: cada consulta SQL deve ser uma ação específica que evolua o estado do banco de dados em direção à sincronização total. Não repita consultas desnecessariamente e ajuste suas instruções com base nos resultados recebidos.

---
Dicas Adicionais:
- Controle de Estado: Implemente, se possível, uma forma de marcar ou registrar quais comandos já foram enviados e seus efeitos. Dessa forma, você evita redundância.
- Interação Baseada em Feedback: Utilize os resultados das execuções (que serão enviados por mim) para determinar a próxima ação. Se um comando não gerou alterações, revise a necessidade da consulta.
- Planejamento por Etapas: Considere dividir a sincronização em etapas (ex.: criação de tabelas, alteração de colunas, criação de índices, etc.) e só avance para a próxima etapa quando a atual estiver completa.
`;

/**
 * Synchronize database structure based on ER diagram using OpenAI
 * @param {string} erDiagram - ER diagram content
 * @returns {Promise<void>}
 */
const syncDatabaseStructure = async (erDiagram) => {
    const messages = [
        { role: 'system', content: SYSTEM_SYNC },
        { role: 'user', content: erDiagram }
    ];
    
    let iterations = 0;
    const maxIterations = config.openai.maxIterations;
    
    logger.info('Starting database structure synchronization');
    
    while (iterations < maxIterations) {
        const reply = await createChatCompletion(messages);
        
        if (reply.trim() === 'FIM') {
            logger.info('Database structure synchronization completed successfully');
            break;
        }
        
        try {
            const results = await executeQuery(reply);
            
            // Add the result to the conversation
            messages.push({ role: 'user', content: JSON.stringify(results) });
            
        } catch (error) {
            logger.error(`SQL execution error: ${error.message}`);
            // Send error back to AI for correction
            messages.push({ role: 'user', content: error.message });
        }
        
        iterations++;
    }
    
    if (iterations >= maxIterations) {
        logger.warn(`Maximum iterations (${maxIterations}) reached during synchronization`);
    }
};

module.exports = {
    syncDatabaseStructure
};
