const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const Application = require("../models/Application"); // Uygulama modelini ekle
require("dotenv").config();

const router = express.Router();
const upload = multer(); // Multer, buffer kullanıyor

// Supabase Bağlantısı
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Supabase'e Dosya Yükleme Fonksiyonu
const uploadToSupabase = async (file) => {
  const folder = file.mimetype.startsWith("video") ? "videos" : "documents";
  const filePath = `${folder}/${Date.now()}-${file.originalname}`;

  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET_NAME)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw new Error(`Supabase Yükleme Hatası: ${error.message}`);

  // Supabase Public URL'yi oluştur
  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET_NAME}/${filePath}`;
  
  console.log("Yüklenen dosyanın URL'si:", publicUrl); // **BURAYA EKLENDİ**

  return { filename: file.originalname, path: publicUrl };
};


// Başvuru gönderimi
router.post("/submit", upload.array("files", 10), async (req, res) => {
  try {
    const { formId, userId, answers } = req.body;

    // Cevapları JSON formatına geri dönüştür
    const parsedAnswers = JSON.parse(answers);

    // Dosyaları Supabase'e yükle ve `files` dizisini oluştur
    const files = await Promise.all(
      req.files.map(async (file) => {
        return await uploadToSupabase(file);
      })
    );

    // Yeni başvuruyu kaydet
    const newApplication = new Application({
      formId,
      userId,
      answers: parsedAnswers,
      files, // Doğru formatta oluşturulan `files` dizisi burada
    });

    await newApplication.save();

    res.status(201).json({ message: "Başvuru başarıyla kaydedildi!" });
  } catch (error) {
    console.error("Başvuru gönderimi sırasında hata oluştu:", error.message);
    res.status(500).json({ message: "Başvuru gönderimi başarısız oldu!" });
  }
});

// Diğer Rotalar Aynı Kalıyor
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

router.get("/public/:id", async (req, res) => {
  try {
    const applicationId = req.params.id;
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Dosya URL'lerini Supabase public URL ile güncelle
    const updatedFiles = application.files.map((file) => ({
      ...file,
      path: file.path.startsWith("http")
        ? file.path
        : `${process.env.SUPABASE_URL}/storage/v1/object/public/${file.path}`,
    }));

    // Güncellenmiş dosyaları JSON içinde döndür
    res.status(200).json({ ...application._doc, files: updatedFiles });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get("/", async (req, res) => {
  try {
    const applications = await Application.find();
    res.status(200).json(applications);
  } catch (error) {
    console.error("Adaylar alınamadı:", error);
    res.status(500).json({ message: "Adaylar alınamadı" });
  }
});

module.exports = router;
