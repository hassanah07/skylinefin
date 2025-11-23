const mongoose = require("mongoose");
const { Schema } = mongoose;

const EmployeeSchema = new Schema(
  {
    employeeId: {
      type: Number,
      required: true,
    },
    f_name: {
      type: String,
      required: true,
    },
    l_name: {
      type: String,
      required: true,
    },
    father: {
      type: String,
      required: true,
    },
    mother: {
      type: String,
      required: true,
    },
    spouse: {
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
    role: {
      type: String,
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
      default:
        "https://greenacresportsmed.com.au/wp-content/uploads/2018/01/dummy-image.jpg",
    },
    signature: {
      type: String,
      default:
        "https://greenacresportsmed.com.au/wp-content/uploads/2018/01/dummy-image.jpg",
    },

    pan: {
      type: String,
    },
    aadhar: {
      type: String,
    },
    voter: {
      type: String,
    },
    address: {
      type: String,
    },
    landmark: {
      type: String,
    },
    postalData: [],
    experiance: {
      type: String,
    },
    expDuration: {
      type: Number,
    },
    progress: {
      type: Number,
      default: 0,
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

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;
