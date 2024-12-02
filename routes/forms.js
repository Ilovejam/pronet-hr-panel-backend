const express = require("express");
const router = express.Router();
const Form = require("../models/Form"); // Form modelini dahil et

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
  
      const publicLink = `http://localhost:3001/applications/${id}`; // Port 3001 olarak ayarlandı
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
