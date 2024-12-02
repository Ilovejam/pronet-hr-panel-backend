const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true },
    userId: { type: String, required: true },
    answers: [
      {
        question: { type: String, required: true },
        answer: { type: mongoose.Schema.Types.Mixed, required: false },
      },
    ],
    files: [
      {
        filename: { type: String, required: true },
        path: { type: String, required: true },
      },
    ],
    status: { type: String, default: "Pending" }, // Yeni alan eklendi
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", ApplicationSchema);
