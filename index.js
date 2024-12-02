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
const https = require("https");
const http = require("http");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SSL_PORT = 443;

// Self-signed sertifikayı yükleme
const sslOptions = {
  key: fs.readFileSync("ssl/selfsigned.key"),
  cert: fs.readFileSync("ssl/selfsigned.crt"),
};

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

// HTTPS Sunucu Başlatma
https.createServer(sslOptions, app).listen(SSL_PORT, () => {
  console.log(`HTTPS Server is running on port ${SSL_PORT}`);
});

// HTTP Trafiği HTTPS'e Yönlendirme
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(PORT, () => {
  console.log(`HTTP Server is redirecting traffic to HTTPS`);
});
