const express = require("express");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const upload = multer();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Dosya bulunamadı!" });
    }

    const folder = file.mimetype.startsWith("video") ? "videos" : "documents";

    const { data, error } = await supabase.storage
      .from("uploads") // Bucket adınız burada "uploads" olmalı
      .upload(`${folder}/${Date.now()}-${file.originalname}`, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error("Supabase Yükleme Hatası:", error);
      throw error;
    }

    const { publicUrl } = supabase.storage
      .from("uploads")
      .getPublicUrl(data.path);

    res.status(200).json({ message: "Dosya başarıyla yüklendi!", url: publicUrl });
  } catch (error) {
    console.error("Yükleme hatası:", error);
    res.status(500).json({ message: "Yükleme başarısız oldu!" });
  }
});

app.listen(3000, () => console.log("Server is running on port 3000"));
