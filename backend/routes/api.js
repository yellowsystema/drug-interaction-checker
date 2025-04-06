const express = require('express');
const axios = require('axios');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Import GoogleGenerativeAI

const router = express.Router();

router.post('/submit', async (req, res) => {
    const { illness, medications, allergies } = req.body;

    console.log('Received Data:', { illness, medications, allergies });

    // Construct the prompt for the Gemini model
    const prompt = `
      Based on the following inputs:
      - Illness: ${illness}
      - Medications: ${medications}
      - Allergies: ${allergies}

      Provide a list of 4 foods to avoid, with a short explanation for each.
      Return the response as a plain JSON object (without Markdown formatting) where the keys are the food names and the values are the reasons to avoid them.  The JSON object should be valid and parsable.
    `;

    try {
        // Initialize the Gemini AI model
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Corrected line

        // Send the prompt to the Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let aiResponse = response.text();

        // Clean the response (remove Markdown formatting)
        aiResponse = aiResponse.replace(/```json\n/g, ''); // Remove ```json
        aiResponse = aiResponse.replace(/```/g, '');      // Remove remaining ```
        aiResponse = aiResponse.trim();                    // Remove leading/trailing whitespace

        const foodRecommendations = JSON.parse(aiResponse); // Parse the JSON response

        // Send the AI-generated recommendations back to the frontend
        res.status(200).json({
            message: 'Here are some foods to avoid based on your inputs.',
            recommendations: foodRecommendations,
        });
    } catch (error) {
        console.error('Error communicating with Gemini API:', error);
        res.status(500).json({
            message: 'An error occurred while processing your request.',
        });
    }
});

module.exports = router;