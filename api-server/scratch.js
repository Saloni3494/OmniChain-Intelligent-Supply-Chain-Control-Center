const { genkit, z } = require('genkit');
const { googleAI } = require('@genkit-ai/google-genai');

const ai = genkit({
  plugins: [googleAI({ apiKey: 'AIzaSyAu_wp9y93d1vCi1DeHGnF9E0f0vi-_5Gs' })],
});

async function run() {
  const { text } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: 'Hello world'
  });
  console.log(text);
}

run().catch(console.error);
