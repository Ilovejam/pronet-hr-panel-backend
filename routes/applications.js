const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Application = require("../models/Application"); // Uygulama modelini ekle
const router = express.Router();

// Multer yükleme ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype.startsWith("video")
      ? "./uploads/video"
      : "./uploads/doc";
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

  router.put("/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
  
      const updatedApplication = await Application.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
  
      if (!updatedApplication) {
        return res.status(404).json({ message: "Aday bulunamadı." });
      }
  
      res.status(200).json(updatedApplication);
    } catch (error) {
      console.error("Status update error:", error);
      res.status(500).json({ message: "Status güncellenirken hata oluştu." });
    }
  });
  
  
  
  // Public paylaşım için aday bilgilerini döndür
  router.get("/public/:id", async (req, res) => {
    try {
      const applicationId = req.params.id;
      const application = await Application.findById(applicationId);
  
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
  
      res.status(200).json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  
router.get("/", async (req, res) => {
    try {
      const applications = await Application.find(); // Applications koleksiyonundan tüm veriyi çek
      res.status(200).json(applications);
    } catch (error) {
      console.error("Adaylar alınamadı:", error);
      res.status(500).json({ message: "Adaylar alınamadı" });
    }
  });
  
// Başvuru gönderimi
router.post("/submit", upload.array("files", 10), async (req, res) => {
  try {
    const { formId, userId, answers } = req.body;

    // Cevapları JSON formatına geri dönüştür
    const parsedAnswers = JSON.parse(answers);

    // Dosya yollarını topla
    const files = req.files.map((file) => ({
      filename: file.filename,
      path: file.path,
    }));

    const newApplication = new Application({
      formId,
      userId,
      answers: parsedAnswers,
      files,
    });

    await newApplication.save();

    res.status(201).json({ message: "Başvuru başarıyla kaydedildi!" });
  } catch (error) {
    console.error("Başvuru gönderimi sırasında hata oluştu:", error);
    res.status(500).json({ message: "Başvuru gönderimi başarısız oldu!" });
  }
});

module.exports = router;
