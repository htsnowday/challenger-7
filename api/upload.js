// api/upload.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { filename, data } = req.body;
  if (!filename || !data) {
    return res.status(400).json({ error: "Missing `filename` or `data`" });
  }

  // Decode Base64 into a Buffer
  const buffer = Buffer.from(data, "base64");

  try {
    const fileResponse = await openai.files.create({
      file: [filename, buffer],
      purpose: "user_data",
    });
    // Return the file ID to the client
    res.status(200).json({ fileId: fileResponse.id });
  } catch (error) {
    console.error("File upload error:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to upload file" });
  }
}
