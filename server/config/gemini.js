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

const getModel = (modelName = 'gemini-2.5-flash') => {
    const client = getGeminiClient();
    return client.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: 0, // 0 means deterministic (same response for same input)
            topK: 1,
            topP: 0.1
        }
    });
};

module.exports = { getGeminiClient, getModel };
