/**
 * Configuration module to centralize all environment variable access
 */
module.exports = {
    // Server config
    port: process.env.PORT || 3000,
    
    // Database config
    database: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_DATABASE,
        connectionLimit: 10
    },
    
    // OpenAI config
    openai: {
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        maxIterations: process.env.MAX_ITERATIONS || 30
    }
};
