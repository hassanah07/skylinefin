const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
    },
    otpExpiry: {
      type: Date,
    },
    image: {
      type: String,
    },
    sign: {
      type: String,
    },
    role: {
      type: String,
      default: "Admin",
    },
    status: {
      type: Boolean,
      default: true,
    },
    address: {
      type: String,
    },
    landmark: {
      type: String,
    },
    area: {
      type: String,
    },
    login: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;
