const express = require("express");
const router = express.Router();
const Form = require("../models/Form"); // Form modelini dahil et
 const { OpenAI } = require("openai");
require("dotenv").config(); // .env dosyasını yükle


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
// Tüm formları listele
router.get("/", async (req, res) => {
  try {
    const forms = await Form.find(); // Tüm form kayıtlarını getir
    res.status(200).json(forms);
  } catch (error) {
    console.error("Başvurular alınamadı:", error);
    res.status(500).json({ error: "Başvurular alınamadı." });
  }
});

router.get("/:id", async (req, res) => {
    try {
      const form = await Form.findById(req.params.id);
      if (!form) {
        return res.status(404).json({ error: "Form bulunamadı." });
      }
      res.status(200).json(form);
    } catch (error) {
      console.error("Form getirilemedi:", error);
      res.status(500).json({ error: "Bir hata oluştu." });
    }
  });
  router.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { title, questions } = req.body;
  
    try {
      const updatedForm = await Form.findByIdAndUpdate(
        id,
        { title, questions },
        { new: true, runValidators: true }
      );
  
      if (!updatedForm) {
        return res.status(404).json({ error: "Form bulunamadı." });
      }
  
      res.status(200).json(updatedForm);
    } catch (error) {
      console.error("Form güncellenemedi:", error);
      res.status(500).json({ error: "Bir hata oluştu." });
    }
  });
  router.post("/generate-link/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const form = await Form.findById(id);
      if (!form) {
        return res.status(404).json({ message: "Form bulunamadı." });
      }
  
      const publicLink = `https://pronet-hr-panel-backend.vercel.app/applications/${id}`;
      res.status(200).json({ link: publicLink });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Public link oluşturulurken hata oluştu." });
    }
  });
  
  router.get("/public/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const form = await Form.findById(id); // Form verisini al
      if (!form) {
        return res.status(404).json({ message: "Form bulunamadı!" });
      }
  
      // Public olarak dönecek form detaylarını filtrele
      const publicForm = {
        title: form.title,
        description: form.description,
        questions: form.questions.map((q) => ({
          question: q.question,
          type: q.type,
          options: q.options || [],
        })),
      };
  
      res.status(200).json(publicForm);
    } catch (error) {
      console.error("Public form alınırken hata oluştu:", error);
      res.status(500).json({ message: "Form detayları alınırken bir hata oluştu." });
    }
  });
  
  
  
  
  
// Yeni form ekleme
router.post("/create-form", async (req, res) => {
  const { title, questions } = req.body;

  try {
    const newForm = new Form({ title, questions });
    await newForm.save();
    res.status(201).json({ message: "Form başarıyla oluşturuldu!", form: newForm });
  } catch (error) {
    console.error("Form oluşturulamadı:", error);
    res.status(500).json({ error: "Form oluşturulamadı." });
  }
});

module.exports = router;
