const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String }, // Form açıklaması
    questions: [
      {
        question: { type: String, required: true },
        type: { type: String, required: true }, // Text, Multiple Choice, Video, File, vs.
        options: [String], // Çoktan seçmeli seçenekler
        value: mongoose.Schema.Types.Mixed, // Tarih veya dosya için opsiyonel değer
      },
    ],
  },
  { timestamps: true } // createdAt ve updatedAt otomatik eklenir
);

module.exports = mongoose.model("Form", FormSchema);
