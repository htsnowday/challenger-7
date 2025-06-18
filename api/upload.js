// api/upload.js

// ① Turn off Next.js’s JSON parser so we can handle multipart
export const config = {
  api: {
    bodyParser: false,
  },
};

import OpenAI from "openai";
import Busboy from "busboy";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const busboy = new Busboy({ headers: req.headers });
  let filename = "";
  let buffer = Buffer.alloc(0);

  // ② Collect file chunks
  busboy.on("file", (_fieldname, file, info) => {
    filename = info.filename;
    file.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
    });
  });

  // ③ When done receiving, call OpenAI
  busboy.on("finish", async () => {
    if (!filename || buffer.length === 0) {
      return res.status(400).json({ error: "No file received" });
    }
    try {
      const fileRes = await openai.files.create({
        file: [filename, buffer],
        purpose: "user_data",
      });
      return res.status(200).json({ fileId: fileRes.id });
    } catch (err) {
      console.error("File upload error:", err);
      const msg = err.response?.data?.error?.message || err.message;
      return res.status(500).json({ error: msg });
    }
  });

  // ④ Pipe the incoming request into Busboy
  req.pipe(busboy);
}
