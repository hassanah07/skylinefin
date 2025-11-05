const mongoose = require("mongoose");
const { Schema } = mongoose;

const EmiSchema = new Schema(
  {
    loanAccountNumber: {
      type: Number,
      required: true,
    },
    loanAmount: {
      type: Number,
      required: true,
    },
    interest: {
      type: Number,
      required: true,
    },
    tenure: {
      type: Number,
      required: true,
    },
    totalInterest: {
      type: Number,
      required: true,
    },
    payableAmount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    schedule: [],
  },
  { timestamps: true }
);

const Emi = mongoose.model("Emi", EmiSchema);
module.exports = Emi;
