const mongoose = require("mongoose");
const { Schema } = mongoose;

const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cinNo: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pan: {
      type: String,
      required: true,
    },
    tan: {
      type: String,
    },
    incDate: {
      type: Date,
    },
    type: {
      type: String,
    },
    field: {
      type: String,
    },
    sign: {
      type: String,
    },
    link: {
      type: String,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", CompanySchema);
module.exports = Company;
