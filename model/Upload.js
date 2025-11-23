// models/Upload.js
const mongoose = require("mongoose");

const UploadSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  filename: { type: String }, // local filename or cloudinary filename
  url: { type: String, required: true }, // accessible URL
  mimeType: { type: String },
  size: { type: Number },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional link to user
  public_id: { type: String }, // Cloudinary public_id (optional)
  profileId: { type: String },
  uploadType: { type: String }, // Cloudinary public_id (optional)
  createdAt: { type: Date, default: Date.now },
});

const Upload = mongoose.model("Upload", UploadSchema);
module.exports = Upload;
