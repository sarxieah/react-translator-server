const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors()); // Allow all origins
app.use(express.json());

// Hugging Face API key
const HF_API_KEY = process.env.HF_TOKEN;

if (!HF_API_KEY) {
    console.error("Hugging Face API token is not set in .env file.");
    process.exit(1);
}

// Text generation function
async function generateText(prompt) {
    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/gpt2",
            {
                inputs: prompt,
                parameters: { max_new_tokens: 20 },
            },
            {
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                },
            }
        );
        return response.data.generated_text || "No text generated.";
    } catch (error) {
        console.error("Error generating text:", error);
        return "Error in generation.";
    }
}

// Endpoint to test text generation
app.post("/generate", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).send("Prompt is required.");
    }
    const generatedText = await generateText(prompt);
    res.send(generatedText);
});

// Load the app
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log("Send a POST request to /generate with a prompt in the body.");
});
