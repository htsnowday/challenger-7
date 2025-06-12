import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }
  const { input } = req.body;
  if (!input || typeof input !== "string") {
    return res.status(400).json({ error: "Missing `input` in request body." });
  }
  try {
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: "You are a helpful assistant.",
      input,
    });
    return res.status(200).json({ output: response.output_text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Internal Error" });
  }
}
