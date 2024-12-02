const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const formRoutes = require("./routes/forms");
const applicationRoutes = require("./routes/applications");
const authRoutes = require("./routes/auth");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDirs = ["./uploads", "./uploads/doc", "./uploads/video"];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Bağlantısı
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Rotaları
app.use("/forms", formRoutes);
app.use("/applications", applicationRoutes);
app.use("/auth", authRoutes);

// Sunucu Başlatma
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
