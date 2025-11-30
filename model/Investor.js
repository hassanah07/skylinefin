const mongoose = require("mongoose");

const { Schema } = mongoose;

const InvestorSchema = new Schema(
  {
    investorId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
      enum: ["Mr", "Miss"],
    },
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    father: { type: String, trim: true, required: true },
    mother: { type: String, trim: true },
    spouse: { type: String, trim: true },
    dob: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
      index: true,
    },
    phone: { type: Number, trim: true, required: true },
    password: { type: String, trim: true, required: true },
    image: { type: String, trim: true },
    sign: { type: String, trim: true },
    pan: { type: String, trim: true },
    aadhar: { type: Number, trim: true },
    voter: { type: String, trim: true },
    company: { type: String, trim: true },
    amount: { type: Number, default: 0 },
    currency: { type: String, trim: true, default: "INR" },
    profitPercentage: { type: Number, min: 0, max: 20 },
    stage: {
      type: String,
      enum: ["pre-seed", "seed", "series A", "series B", "growth", "other"],
      default: "other",
    },
    address: { type: String, trim: true },
    landmark: { type: String, trim: true },
    postalData: [],
    notes: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isBranch: {
      type: Boolean,
      default: false,
    },
    branchId: {
      type: String,
    },
    assignTo: {
      type: String,
    },
    startFrom: {
      type: String,
    },
    createdBy: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Investor = mongoose.model("Investor", InvestorSchema);
module.exports = Investor;
