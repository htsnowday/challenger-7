// api/upload.js

// 1) Increase JSON body‐parser limit to, say, 5 MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",  // <-- allow up to 5 megabytes
    },
  },
};

import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const { filename, data } = req.body;
  if (!filename || !data) {
    return res.status(400).json({ error: "filename & data required" });
  }

  // decode the Base64
  let buffer;
  try {
    buffer = Buffer.from(data, "base64");
  } catch (e) {
    console.error("🔴 Base64 decode failed:", e);
    return res.status(400).json({ error: "Invalid file data" });
  }

  // call OpenAI to store the file
  try {
    const file = await openai.files.create({
      file: [filename, buffer],
      purpose: "user_data",
    });
    return res.status(200).json({ fileId: file.id });
  } catch (err) {
    console.error("🔴 File upload error:", err);
    const msg = err.response?.data?.error?.message || err.message;
    return res.status(500).json({ error: msg });
  }
}
