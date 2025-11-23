// routes/uploadLocal.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Upload from "../models/Upload.js";

const router = express.Router();
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Upload and create DB record
router.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    const fileUrl = `/uploads/${req.file.filename}`; // served by express.static
    const doc = await Upload.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      url: fileUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
      owner: req.body.id, // if you have auth
      profileId: req.body.id, // if you have auth
    });

    res.json({ success: true, file: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// List all uploads (optionally filter by owner)
router.get("/", async (req, res) => {
  const uploads = await Upload.find().sort({ createdAt: -1 }).limit(100);
  res.json(uploads);
});

// Get single upload by id
router.get("/:id", async (req, res) => {
  const upload = await Upload.findById(req.params.id);
  if (!upload) return res.status(404).json({ error: "Not found" });
  res.json(upload);
});

// Delete upload (remove file from disk + delete DB doc)
router.delete("/:id", async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ error: "Not found" });

    // remove file from disk
    const filePath = path.join(UPLOAD_DIR, upload.filename);
    fs.unlink(filePath, (err) => {
      // ignore file-not-found errors but log others
      if (err && err.code !== "ENOENT") console.error("fs.unlink error", err);
    });

    await upload.remove();
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
