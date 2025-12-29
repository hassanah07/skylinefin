// server/routes/uploadLocal.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Upload = require("../model/Upload.js");

const router = express.Router();
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Create upload record
router.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileUrl = `/uploads/${req.file.filename}`;
    const doc = await Upload.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      url: fileUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    res.json({ success: true, file: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Get all uploaded files
router.get("/", async (req, res) => {
  const uploads = await Upload.find().sort({ createdAt: -1 });
  res.json(uploads);
});

// Get one file
router.get("/:id", async (req, res) => {
  const upload = await Upload.findById(req.params.id);
  if (!upload) return res.status(404).json({ error: "Not found" });
  res.json(upload);
});

// Delete file
router.delete("/:id", async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ error: "Not found" });

    const filePath = path.join(UPLOAD_DIR, upload.filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") console.error("fs.unlink error", err);
    });

    await upload.remove();
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
