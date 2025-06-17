// api/chat.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const VECTOR_STORE_ID = process.env.VECTOR_STORE_ID;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { message, fileIds } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Missing `message` in body." });
  }

  // Build the `input` payload:
  let inputPayload;
  if (Array.isArray(fileIds) && fileIds.length > 0) {
    const content = [
      // first include each uploaded file
      ...fileIds.map((fid) => ({ type: "input_file", file_id: fid })),
      // then the user’s text
      { type: "input_text", text: message },
    ];
    inputPayload = [{ role: "user", content }];
  } else {
    // plain-text branch
    inputPayload = message;
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4o",                   // Or gpt-4o-mini
      instructions: "You are a helpful assistant.",
      input: inputPayload,
      tools: [{
        type: "file_search",
        vector_store_ids: [VECTOR_STORE_ID],
      }],
    });
    res.status(200).json({ answer: response.output_text });
  } catch (error) {
    console.error("OpenAI error:", error);
    const msg = error.response?.data?.error?.message || error.message;
    res.status(500).json({ error: msg });
  }
}
