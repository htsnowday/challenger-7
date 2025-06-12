import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const VECTOR_STORE_ID = process.env.VECTOR_STORE_ID;  // e.g. "vs_XXXXXXXX"

export default async function handler(req, res) {
  try {
    const userMessage = req.body.message;  // assuming the request sends the user's prompt
    const response = await openai.responses.create({
      model: "gpt-4o",  // Orchestrator model that can use tools
      instructions: "You are a helpful assistant.",  // (optional system role)
      input: userMessage,
      tools: [{
        type: "file_search",
        vector_store_ids: [ VECTOR_STORE_ID ]
      }],
      stream: false  // set true for streaming SSE if your setup supports it
    });
    // Send back the assistant's answer text
    res.status(200).json({ answer: response.output_text });
  } catch (error) {
    console.error("Error from OpenAI:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
}
