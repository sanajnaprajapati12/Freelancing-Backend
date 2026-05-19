import Groq from "groq-sdk";
import Message from "../models/chatModel.js";

const groq = new Groq({
  apiKey: process.env.MY_KEY,
});

export const chatHandler = async (req, res) => {
  try {
    const { message } = req.body;
    const userRole = req.user?.role || "client"; // from auth (or default)
    const file = req.file;

    if (!message && !file) {
      return res.status(400).json({ error: "Message or file required" });
    }

    // 🧠 Role-based system prompt
    let systemPrompt = "";

    if (userRole === "admin") {
      systemPrompt = `
You are an AI assistant helping an ADMIN.
Give detailed, technical, and management-level answers.
Be precise and professional.
`;
    } else if (userRole === "client") {
      systemPrompt = `
You are a helpful AI assistant for CLIENT users.
Explain things in simple and friendly language.
Avoid too much technical jargon.
`;
    } else {
      systemPrompt = `
You are a general AI assistant.
Give helpful and clear answers.
`;
    }

    // Save user message
    const userMsg = new Message({
      role: "user",
      content: message || "File uploaded",
      userRole,
      fileUrl: file ? `/uploads/${file.filename}` : null,
      fileType: file ? file.mimetype : null,
    });

    await userMsg.save();

    // 🤖 AI Response
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message || `User uploaded a file: ${file?.originalname}`,
        },
      ],
    });

    const reply = response.choices[0]?.message?.content;

    // Save AI response
    const aiMsg = new Message({
      role: "assistant",
      content: reply,
      userRole,
    });

    await aiMsg.save();

    res.json({
      reply,
      fileUrl: userMsg.fileUrl,
    });
  } catch (error) {
    console.error("Groq Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
