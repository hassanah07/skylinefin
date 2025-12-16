const mongoose = require("mongoose");
const { Schema } = mongoose;

const DealerSchema = new Schema(
  {
    dealerId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    father: {
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
    signature: {
      type: String,
    },

    pan: {
      type: String,
      required: true,
    },
    aadhar: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      required: true,
    },
    postalData: [],
    location: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: 0,
    },
    login: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
    },
  },
  { timestamps: true }
);

const Dealer = mongoose.model("Dealer", DealerSchema);
module.exports = Dealer;
