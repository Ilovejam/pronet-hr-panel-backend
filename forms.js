const express = require("express");
const { OpenAI } = require("openai");
require("dotenv").config(); // .env dosyasını yükle

const router = express.Router();

// OpenAI API Ayarları
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // .env'den alınan anahtar
});

// Mesleki Sorular Oluşturma
router.post("/generate-questions", async (req, res) => {
  const { jobDescription } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Sen bir asistan olarak Türkçe mülakat soruları oluşturuyorsun." },
        { role: "user", content: `Aşağıdaki iş tanımı için mülakat soruları oluştur: ${jobDescription}` },
      ],
    });

    const questions = completion.choices[0].message.content
  .split("\n")
  .filter((q) => q.trim() !== "")
  .map((question, index) => ({
    question: question.replace(/^\d+\.\s*/, "").trim(), // Mevcut numaralandırmayı temizliyoruz
    type: "Text",
  }));


    res.status(200).json({ questions });
  } catch (error) {
    console.error("Mesleki sorular oluşturulamadı:", error);
    res.status(500).json({ error: "Sorular oluşturulamadı." });
  }
});

module.exports = router;
