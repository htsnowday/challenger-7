 // api/upload.js

 // ① Disable JSON parsing
 export const config = {
   api: { bodyParser: false },
 };

-import OpenAI from "openai";
+import OpenAI, { toFile } from "openai";
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

   busboy.on("file", (_fieldname, file, info) => {
     filename = info.filename;
     file.on("data", (chunk) => {
       buffer = Buffer.concat([buffer, chunk]);
     });
   });

   busboy.on("finish", async () => {
     if (!filename || buffer.length === 0) {
       return res.status(400).json({ error: "No file received" });
     }

+    // ② Convert the Buffer into an SDK-friendly “File” object:
+    let uploadable;
+    try {
+      uploadable = await toFile(buffer, filename);
+    } catch (err) {
+      console.error("❌ toFile helper failed:", err);
+      return res.status(500).json({ error: "Server error converting file" });
+    }

     try {
-      const fileRes = await openai.files.create({
-        file: [filename, buffer],
+      const fileRes = await openai.files.create({
+        file: uploadable,
       ^^^^^^^^^^^^^^^^^^^^^
         purpose: "user_data",
       });
       return res.status(200).json({ fileId: fileRes.id });
     } catch (err) {
       console.error("🔴 File upload error:", err);
       const msg = err.response?.data?.error?.message || err.message;
       return res.status(500).json({ error: msg });
     }
   });

   req.pipe(busboy);
 }
