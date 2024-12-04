const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const formRoutes = require("./routes/forms");
const applicationRoutes = require("./routes/applications");
const authRoutes = require("./routes/auth");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SSL_PORT = 443;

// Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Multer setup (Dosyaları buffer olarak okuyoruz)
const upload = multer();

// Middleware'ler
app.use(cors({
  origin: "*", // Tüm kaynaklardan gelen istekler için izin ver
  methods: ["GET", "POST", "PUT", "DELETE"], // İzin verilen HTTP yöntemleri
  allowedHeaders: ["Content-Type", "Authorization"], // İzin verilen başlıklar
}));


app.use(bodyParser.json());
app.use(express.json());

// MongoDB Bağlantısı
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Supabase'e Dosya Yükleme Endpoint'i
app.post("/uploads", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Dosya bulunamadı!" });
    }

    const folder = file.mimetype.startsWith("video") ? "videos" : "documents";
    const filePath = `${folder}/${Date.now()}-${file.originalname}`;

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .upload(filePath, file.buffer, { contentType: file.mimetype });

    if (error) {
      console.error("Supabase Yükleme Hatası:", error);
      return res.status(500).json({ message: "Dosya yükleme başarısız oldu!" });
    }

    const { publicUrl } = supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME)
      .getPublicUrl(data.path);

    res.status(200).json({ message: "Dosya başarıyla yüklendi!", url: publicUrl });
  } catch (error) {
    console.error("Yükleme sırasında hata:", error);
    res.status(500).json({ message: "Yükleme işlemi başarısız oldu!" });
  }
});

// API Rotaları
app.use("/forms", formRoutes);
app.use("/applications", applicationRoutes);
app.use("/auth", authRoutes);

// HTTPS Sunucu Başlatma
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
