const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getGeminiClient = () => {
    if (!genAI) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not defined in environment variables');
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
};

const getModel = (modelName = 'gemini-2.0-flash') => {
    const client = getGeminiClient();
    return client.getGenerativeModel({ model: modelName });
};

module.exports = { getGeminiClient, getModel };
