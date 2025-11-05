const mongoose = require("mongoose");
const { Schema } = mongoose;

const CustomerSchema = new Schema(
  {
    customerId: {
      type: String,
      required: true,
    },
    occuType: {
      type: String,
      required: true,
    },
    occuType: {
      type: String,
      required: true,
    },

    empType: {
      type: String,
    },
    orgType: {
      type: String,
    },
    BussType: {
      type: String,
    },
    commuType: {
      type: String,
    },
    gstNo: {
      type: String,
    },
    fullName: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
      required: true,
    },
    motherName: {
      type: String,
      required: true,
    },
    spouseName: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
      required: true,
    },
    dependentNo: {
      type: Number,
      required: true,
    },
    religion: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    passport: {
      type: String,
    },
    passportExp: {
      type: String,
    },
    driving: {
      type: String,
    },
    drivingExp: {
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
    voter: {
      type: String,
      required: true,
    },
    upi: {
      type: String,
    },
    email: {
      type: String,
    },
    mobile: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;
