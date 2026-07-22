const { GoogleGenAI } = require("@google/genai");
const {
  questionAnswerPrompt,
  questionExplainPrompt,
} = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc   Generate interview questions and answers using Gemini
// @route  POST /api/ai/generate-questions
// @access Private
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = questionAnswerPrompt(
      role,
      experience,
      topicsToFocus,
      numberOfQuestions
    );

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                question: { type: "STRING" },
                answer: { type: "STRING" }
              },
              required: ["question", "answer"]
            }
          }
        }
      });
    } catch (modelError) {
      console.warn("gemini-3.5-flash-lite failed, attempting fallback to gemini-3.6-flash:", modelError.message);
      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                question: { type: "STRING" },
                answer: { type: "STRING" }
              },
              required: ["question", "answer"]
            }
          }
        }
      });
    }

    // Since we used structured outputs with responseMimeType: "application/json",
    // response.text is guaranteed to be a valid JSON array string directly.
    const data = JSON.parse(response.text);

    res.status(200).json(data);
  } catch (error) {
    console.error("AI Generation Error:", error);
    res
      .status(500)
      .json({ message: "Failed to generate questions", error: error.message });
  }
};

// @desc   Generate explains a interview question
// @route  POST /api/ai/generate-explanation
// @access Private
const generateConceptExplanation = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const prompt = questionExplainPrompt(question);

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              explanation: { type: "STRING" }
            },
            required: ["title", "explanation"]
          }
        }
      });
    } catch (modelError) {
      console.warn("gemini-3.5-flash-lite failed, attempting fallback to gemini-3.6-flash:", modelError.message);
      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              explanation: { type: "STRING" }
            },
            required: ["title", "explanation"]
          }
        }
      });
    }

    const data = JSON.parse(response.text);

    res.status(200).json(data);
  } catch (error) {
    console.error("AI Explanation Error:", error);
    res.status(500).json({
      message: "Failed to generate explanation",
      error: error.message,
    });
  }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation };
