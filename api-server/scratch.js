require('dotenv').config();
const { genkit, z } = require('genkit');
const { googleAI } = require('@genkit-ai/google-genai');

const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
});

async function run() {
  const { text } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: 'Hello world'
  });
  console.log(text);
}

run().catch(console.error);
