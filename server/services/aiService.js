const { getModel } = require('../config/gemini');

// ==========================================
// RESUME ANALYSIS SERVICE
//
// This is where the magic happens!
// We send the resume text to Gemini AI with a carefully
// crafted prompt, and it returns a structured analysis.
//
// KEY CONCEPT - Prompt Engineering:
// The quality of AI output depends heavily on HOW you ask.
// We use a structured prompt that:
// 1. Gives Gemini a clear ROLE (expert recruiter)
// 2. Tells it WHAT to analyze
// 3. Defines the EXACT output format (JSON)
// 4. Sets scoring CRITERIA
// ==========================================

const analyzeResume = async (extractedText) => {
  const model = getModel();

  // The PROMPT — this is the instruction we give to Gemini
  // Think of it like giving very detailed instructions to a human expert
  const prompt = `
You are an expert resume analyst and career coach with 15+ years of experience in HR and recruitment.

Analyze the following resume text and provide a detailed assessment.

RESUME TEXT:
"""
${extractedText}
"""

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "overallScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "summary": "<2-3 sentence overview of the candidate>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "skills": {
    "technical": ["<skill1>", "<skill2>"],
    "soft": ["<skill1>", "<skill2>"]
  },
  "experience": {
    "totalYears": <number or 0 if not clear>,
    "level": "<fresher|junior|mid|senior|lead>"
  },
  "education": {
    "degree": "<highest degree>",
    "field": "<field of study>",
    "institution": "<college/university name>"
  },
  "keywordAnalysis": {
    "presentKeywords": ["<keyword1>", "<keyword2>"],
    "missingKeywords": ["<suggested keyword1>", "<suggested keyword2>"]
  }
}

SCORING CRITERIA:
- overallScore: Based on completeness, relevance, presentation, achievements
- atsScore: Based on keyword optimization, formatting, section headers, bullet points
- Strengths: What the candidate does well
- Weaknesses: What needs improvement
- Suggestions: Actionable steps to improve the resume

Be honest, specific, and constructive in your analysis.
`;

  try {
    // Send prompt to Gemini and get response
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response from Gemini
    // Sometimes Gemini wraps JSON in ```json ... ``` blocks, so we clean it
    const cleanedText = text
      .replace(/```json\n?/g, '')  // Remove ```json
      .replace(/```\n?/g, '')     // Remove closing ```
      .trim();

    const analysis = JSON.parse(cleanedText);

    // Validate that required fields exist
    if (!analysis.overallScore || !analysis.summary) {
      throw new Error('Invalid analysis format from AI');
    }

    return {
      success: true,
      analysis,
    };
  } catch (error) {
    console.error('AI Analysis Error:', error.message);

    // Give a clear message for quota/rate limit errors
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
      return {
        success: false,
        error: 'Gemini AI free tier daily limit reached. Please try again after 1:30 PM IST (midnight Pacific Time) when quota resets.',
      };
    }

    // If AI fails, return a default structure so the app doesn't crash
    return {
      success: false,
      error: error.message,
      analysis: {
        overallScore: 0,
        atsScore: 0,
        summary: 'Analysis could not be completed. Please try again.',
        strengths: [],
        weaknesses: [],
        suggestions: ['Try uploading the resume again'],
        skills: { technical: [], soft: [] },
        experience: { totalYears: 0, level: 'fresher' },
        education: { degree: '', field: '', institution: '' },
        keywordAnalysis: { presentKeywords: [], missingKeywords: [] },
      },
    };
  }
};

module.exports = { analyzeResume };
