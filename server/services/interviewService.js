const { getModel } = require('../config/gemini');

// ==========================================
// INTERVIEW AI SERVICE
//
// Two main functions:
// 1. generateQuestions — Creates interview questions based on resume + job role
// 2. evaluateAnswer — Scores user's answer and gives feedback
// ==========================================

// ---- Generate Interview Questions ----
// Takes resume text + job role → returns array of questions
const generateQuestions = async (resumeText, targetRole, category = 'mixed', difficulty = 'medium') => {
    const model = getModel();

    const prompt = `
You are an expert technical interviewer at a top tech company.

Based on the candidate's resume and the target role, generate exactly 8 interview questions.

CANDIDATE RESUME:
"""
${resumeText.substring(0, 3000)}
"""

TARGET ROLE: ${targetRole}
INTERVIEW CATEGORY: ${category}
DIFFICULTY: ${difficulty}

RULES:
- Generate exactly 8 questions
- Mix question types based on category:
  * "mixed" = 3 technical + 2 behavioral + 2 situational + 1 general
  * "technical" = 7 technical + 1 general
  * "behavioral" = 7 behavioral + 1 general
  * "hr" = 4 HR + 2 behavioral + 2 general
- Questions should be relevant to the candidate's skills and experience
- Vary difficulty levels
- Make questions specific, not generic

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "questions": [
    {
      "question": "<the interview question>",
      "category": "<technical|behavioral|situational|general>",
      "difficulty": "<easy|medium|hard>"
    }
  ]
}
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text()
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(text);

        if (!parsed.questions || !Array.isArray(parsed.questions)) {
            throw new Error('Invalid questions format');
        }

        return { success: true, questions: parsed.questions };
    } catch (error) {
        console.error('Question generation error:', error.message);

        if (error.status === 429 || error.message?.includes('429')) {
            return {
                success: false,
                error: 'AI rate limit reached. Please try again in a few minutes.',
            };
        }

        return { success: false, error: error.message };
    }
};

// ---- Evaluate a Single Answer ----
// Takes question + user's answer → returns score + feedback + model answer
const evaluateAnswer = async (question, userAnswer, targetRole) => {
    const model = getModel();

    const prompt = `
You are an expert interviewer evaluating a candidate's answer.

QUESTION: "${question}"
TARGET ROLE: ${targetRole}
CANDIDATE'S ANSWER: "${userAnswer}"

Evaluate the answer and respond ONLY with valid JSON (no markdown):
{
  "score": <number 1-10>,
  "feedback": "<2-3 sentences of constructive feedback>",
  "modelAnswer": "<what a great answer would look like, 3-4 sentences>"
}

SCORING GUIDE:
- 1-3: Poor — missing key points, irrelevant, or too vague
- 4-5: Below average — partially correct but lacks depth
- 6-7: Good — covers main points with decent clarity
- 8-9: Very good — comprehensive, specific, with examples
- 10: Excellent — perfect answer demonstrating deep expertise
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text()
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(text);
        return { success: true, evaluation: parsed };
    } catch (error) {
        console.error('Answer evaluation error:', error.message);

        if (error.status === 429 || error.message?.includes('429')) {
            return {
                success: false,
                error: 'AI rate limit reached. Please try again in a few minutes.',
            };
        }

        return {
            success: false,
            error: error.message,
            evaluation: { score: 0, feedback: 'Could not evaluate. Try again.', modelAnswer: '' },
        };
    }
};

module.exports = { generateQuestions, evaluateAnswer };
