// backend/routes/upload.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Upload = require("../model/Upload.js");
const fetchAdmin = require("../middleware/fetchAdmin.js");
const Admin = require("../model/Admin.js");
const Investor = require("../model/Investor.js");
const Customer = require("../model/Customer.js");
const Loan = require("../model/Loan.js");
const Dealer = require("../model/Dealer.js");
const Employee = require("../model/Employee.js");
const Company = require("../model/Company.js");

const router = express.Router();
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// admin uploads
router.get("/uploads/:filename", fetchAdmin, (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(process.cwd(), "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.sendFile(filePath);
});
//photo: Upload and create DB record
router.post("/photo", fetchAdmin, upload.single("photo"), async (req, res) => {
  const userId = req.admin.id;
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    const fileUrl = `/uploads/${req.file.filename}`;

    // Get previous photo from DB
    const admin = await Admin.findById(userId);
    if (admin.image) {
      const fs = require("fs");
      const oldPath = path.join(
        process.cwd(),
        "uploads",
        path.basename(admin.image)
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath); // Delete previous file
      }
    }

    // Update DB
    const update = await Admin.findByIdAndUpdate(
      req.body.id,
      { image: fileUrl },
      { new: true }
    );

    res.json({ msg: "Image Uploaded", status: true, doc: req.file, update });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Upload failed", status: false });
  }
});
//sign: Upload and create DB record
router.post("/sign", fetchAdmin, upload.single("sign"), async (req, res) => {
  const userId = req.admin.id;
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    const fileUrl = `/uploads/${req.file.filename}`;

    // Get previous photo from DB
    const admin = await Admin.findById(userId);
    if (admin.image) {
      const fs = require("fs");
      const oldPath = path.join(
        process.cwd(),
        "uploads",
        path.basename(admin.sign)
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath); // Delete previous file
      }
    }

    // Update DB
    const update = await Admin.findByIdAndUpdate(
      req.body.id,
      { sign: fileUrl },
      { new: true }
    );

    res.json({
      msg: "Signature Uploaded",
      status: true,
      doc: req.file,
      update,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Upload failed", status: false });
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

// investor uploads
//photo: Upload and create DB record
router.post(
  "/invphoto",
  fetchAdmin,
  upload.single("photo"),
  async (req, res) => {
    const userId = req.admin.id;
    try {
      if (!req.file) return res.status(400).json({ error: "No file" });

      const fileUrl = `/uploads/${req.file.filename}`;

      // Get previous photo from DB
      const investor = await Investor.findById(req.body.id);
      if (investor.image) {
        const fs = require("fs");
        const oldPath = path.join(
          process.cwd(),
          "uploads",
          path.basename(investor.image)
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // Delete previous file
        }
      }

      // Update DB
      const update = await Investor.findByIdAndUpdate(
        req.body.id,
        { image: fileUrl },
        { new: true }
      );

      res.json({ msg: "Image Uploaded", status: true, doc: req.file, update });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Upload failed", status: false });
    }
  }
);
//sign: Upload and create DB record
router.post("/invsign", fetchAdmin, upload.single("sign"), async (req, res) => {
  const userId = req.admin.id;
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    const fileUrl = `/uploads/${req.file.filename}`;

    // Get previous photo from DB
    const investor = await Investor.findById(req.body.id);
    if (investor.sign) {
      const fs = require("fs");
      const oldPath = path.join(
        process.cwd(),
        "uploads",
        path.basename(investor.sign)
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath); // Delete previous file
      }
    }

    // Update DB
    const update = await Investor.findByIdAndUpdate(
      req.body.id,
      { sign: fileUrl },
      { new: true }
    );

    res.json({
      msg: "Signature Uploaded",
      status: true,
      doc: req.file,
      update,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Upload failed", status: false });
  }
});

// Customers uploads
//photo: Upload and create DB record
router.post(
  "/custphoto",
  fetchAdmin,
  upload.single("photo"),
  async (req, res) => {
    const userId = req.admin.id;
    try {
      if (!req.file) return res.status(400).json({ error: "No file" });

      const fileUrl = `/uploads/${req.file.filename}`;

      // Get previous photo from DB
      const customer = await Customer.findById(req.body.id);
      if (customer.image) {
        const fs = require("fs");
        const oldPath = path.join(
          process.cwd(),
          "uploads",
          path.basename(customer.image)
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // Delete previous file
        }
      }

      // Update DB
      const update = await Customer.findByIdAndUpdate(
        req.body.id,
        { image: fileUrl },
        { new: true }
      );

      res.json({ msg: "Image Uploaded", status: true, doc: req.file, update });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Upload failed", status: false });
    }
  }
);
//sign: Upload and create DB record
router.post(
  "/custsign",
  fetchAdmin,
  upload.single("sign"),
  async (req, res) => {
    const userId = req.admin.id;
    try {
      if (!req.file) return res.status(400).json({ error: "No file" });

      const fileUrl = `/uploads/${req.file.filename}`;

      // Get previous photo from DB
      const customer = await Customer.findById(req.body.id);
      if (customer.sign) {
        const fs = require("fs");
        const oldPath = path.join(
          process.cwd(),
          "uploads",
          path.basename(customer.sign)
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // Delete previous file
        }
      }

      // Update DB
      const update = await Customer.findByIdAndUpdate(
        req.body.id,
        { sign: fileUrl },
        { new: true }
      );

      res.json({
        msg: "Signature Uploaded",
        status: true,
        doc: req.file,
        update,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Upload failed", status: false });
    }
  }
);
//documents: Upload and create DB record
router.post(
  "/documents",
  fetchAdmin,
  upload.single("document"),
  async (req, res) => {
    const userId = req.admin.id;
    try {
      if (!req.file) return res.status(400).json({ error: "No file" });

      const fileUrl = `/uploads/${req.file.filename}`;

      const getLoanNo = await Loan.findById(req.body.id);
      const getUserId = await Customer.findOne({
        customerId: getLoanNo.customerId,
      });
      // Get previous photo from DB
      const customer = await Customer.findById(req.body.id);
      if (customer) {
        const oldPath = path.join(
          process.cwd(),
          "uploads",
          path.basename(customer.sign)
        );
      }

      // Update DB
      const update = await Upload.create({
        loanAccountNumber: getLoanNo.loanAccountNumber,
        filename: req.file.filename,
        url: fileUrl,
        userid: getUserId._id,
      });

      res.json({
        msg: "Document Uploaded",
        status: true,
        update,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Upload failed", status: false });
    }
  }
);

// Dealers uploads
//photo: Upload and create DB record
router.post(
  "/dealerphoto",
  fetchAdmin,
  upload.single("photo"),
  async (req, res) => {
    const userId = req.admin.id;
    try {
      if (!req.file) return res.status(400).json({ error: "No file" });

      const fileUrl = `/uploads/${req.file.filename}`;

      // Get previous photo from DB
      const dealer = await Dealer.findById(req.body.id);
      if (dealer.image) {
        const fs = require("fs");
        const oldPath = path.join(
          process.cwd(),
          "uploads",
          path.basename(dealer.image)
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // Delete previous file
        }
      }

      // Update DB
      const update = await Dealer.findByIdAndUpdate(
        req.body.id,
        { image: fileUrl },
        { new: true }
      );

      res.json({ msg: "Image Uploaded", status: true, doc: req.file, update });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Upload failed", status: false });
    }
  }
);
//sign: Upload and create DB record
router.post(
  "/dealersign",
  fetchAdmin,
  upload.single("sign"),
  async (req, res) => {
    const userId = req.admin.id;
    try {
      if (!req.file) return res.status(400).json({ error: "No file" });

      const fileUrl = `/uploads/${req.file.filename}`;

      // Get previous photo from DB
      const dealer = await Dealer.findById(req.body.id);
      if (dealer.sign) {
        const fs = require("fs");
        const oldPath = path.join(
          process.cwd(),
          "uploads",
          path.basename(dealer.signature)
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // Delete previous file
        }
      }

      // Update DB
      const update = await Dealer.findByIdAndUpdate(
        req.body.id,
        { signature: fileUrl },
        { new: true }
      );

      res.json({
        msg: "Signature Uploaded",
        status: true,
        doc: req.file,
        update,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Upload failed", status: false });
    }
  }
);
//documents: Upload and create DB record
router.post(
  "/documents",
  fetchAdmin,
  upload.single("document"),
  async (req, res) => {
    const userId = req.admin.id;
    try {
      if (!req.file) return res.status(400).json({ error: "No file" });

      const fileUrl = `/uploads/${req.file.filename}`;

      const getLoanNo = await Loan.findById(req.body.id);
      const getUserId = await Customer.findOne({
        customerId: getLoanNo.customerId,
      });
      // Get previous photo from DB
      const customer = await Customer.findById(req.body.id);
      if (customer) {
        const oldPath = path.join(
          process.cwd(),
          "uploads",
          path.basename(customer.sign)
        );
      }

      // Update DB
      const update = await Upload.create({
        loanAccountNumber: getLoanNo.loanAccountNumber,
        filename: req.file.filename,
        url: fileUrl,
        userid: getUserId._id,
      });

      res.json({
        msg: "Document Uploaded",
        status: true,
        update,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Upload failed", status: false });
    }
  }
);

// document: listout all uploaded documents of LoanAccount Number
router.post("/doclist", fetchAdmin, async (req, res) => {
  try {
    const list = await Upload.find({
      loanAccountNumber: req.body.loanAccountNumber,
    });

    res.json({
      msg: `${list.length} Documents Found`,
      status: true,
      list,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", status: false });
  }
});

// get listed of all uploaded files
router.get("/listuploads", (req, res) => {
  const uploadsPath = path.join(__dirname, "../uploads");

  fs.readdir(uploadsPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to scan directory", err });
    }

    res.json({
      files: files, // array of filenames
      count: files.length,
    });
  });
});

//dealer documents: Upload and create DB record
router.post(
  "/dealerDocuments",
  fetchAdmin,
  upload.single("document"),
  async (req, res) => {
    const userId = req.admin.id;
    try {
      if (!req.file) return res.status(400).json({ error: "No file" });

      const fileUrl = `/uploads/${req.file.filename}`;

      // Get previous photo from DB
      const dealer = await Dealer.findById(req.body.id);
      if (dealer) {
        // Update DB
        const update = await Upload.create({
          loanAccountNumber: 777777777777777, //15 digit number: 7 means dealer
          filename: req.file.filename,
          url: fileUrl,
          dealerid: req.body.id,
        });

        res.json({
          msg: "Document Uploaded",
          status: true,
          update,
        });
      } else {
        res.json({
          msg: "Dealer Not Found",
          status: false,
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Upload failed", status: false });
    }
  }
);
//Dealer document: listout all uploaded documents of LoanAccount Number
router.post("/dealerdoclist", fetchAdmin, async (req, res) => {
  try {
    const list = await Upload.find({
      dealerid: req.body.id,
    });

    res.json({
      msg: `${list.length} Documents Found`,
      status: true,
      list,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", status: false });
  }
});
// Employee uploads
//Employee photo: Upload and create DB record
router.post(
  "/empPhoto",
  fetchAdmin,
  upload.single("photo"),
  async (req, res) => {
    const userId = req.admin.id;
    try {
      if (!req.file) return res.status(400).json({ error: "No file" });

      const fileUrl = `/uploads/${req.file.filename}`;

      // Get previous photo from DB
      const employee = await Employee.findById(req.body.id);
      if (employee.image) {
        const fs = require("fs");
        const oldPath = path.join(
          process.cwd(),
          "uploads",
          path.basename(employee.image)
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // Delete previous file
        }
      }

      // Update DB
      const update = await Employee.findByIdAndUpdate(
        req.body.id,
        { image: fileUrl },
        { new: true }
      );

      res.json({ msg: "Image Uploaded", status: true, doc: req.file, update });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Upload failed", status: false });
    }
  }
);
//Employee sign: Upload and create DB record
router.post("/empSign", fetchAdmin, upload.single("sign"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });

    const fileUrl = `/uploads/${req.file.filename}`;

    // Get previous photo from DB
    const employee = await Employee.findById(req.body.id);
    if (employee.sign) {
      const fs = require("fs");
      const oldPath = path.join(
        process.cwd(),
        "uploads",
        path.basename(employee.signature)
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath); // Delete previous file
      }
    }

    // Update DB
    const update = await Employee.findByIdAndUpdate(
      req.body.id,
      { signature: fileUrl },
      { new: true }
    );

    res.json({
      msg: "Signature Uploaded",
      status: true,
      // doc: req.file,
      update,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Upload failed", status: false });
  }
});

//Company Sign: Upload and create DB record
router.post(
  "/companySign",
  fetchAdmin,
  upload.single("sign"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file" });

      const fileUrl = `/uploads/${req.file.filename}`;

      // Get previous sign from DB
      const company = await Company.find(req.body.id);

      if (company[0].sign) {
        const fs = require("fs");
        const oldPath = path.join(
          process.cwd(),
          "uploads",
          path.basename(company[0].sign)
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath); // Delete previous file
        }
      }

      // Update DB
      const update = await Company.findByIdAndUpdate(
        company[0]._id,
        { sign: fileUrl },
        { new: true }
      );

      res.json({
        msg: "Signature Uploaded",
        status: true,
        // doc: req.file,
        update,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Upload failed", status: false });
    }
  }
);

module.exports = router;
