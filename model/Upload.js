const mongoose = require("mongoose");

const UploadSchema = new mongoose.Schema(
  {
    loanAccountNumber: { type: String },
    filename: { type: String },
    url: { type: String },
    userid: { type: String },
  },
  { timestamps: true }
);

const Upload = mongoose.model("Upload", UploadSchema);
module.exports = Upload;
