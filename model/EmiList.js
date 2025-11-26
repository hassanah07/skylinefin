const mongoose = require("mongoose");
const { Schema } = mongoose;

const EmiSchema = new Schema(
  {
    loanAccountNumber: {
      type: Number,
      required: true,
    },
    customerId: {
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
    emiPayment: [
      {
        emiNumber: { type: String },
        txnNumber: { type: String },
        month: { type: Number },
        opening: { type: Number },
        emi: { type: Number },
        principal: { type: Number },
        interest: { type: Number },
        gstOnInterest: { type: Number },
        closing: { type: Number },
        dueDate: { type: String },
        painOn: { type: Date },
        status: { type: Boolean, default: false },
      },
    ],
    // dueDate: {
    //   type: String,
    //   required: true,
    // },
  },
  { timestamps: true }
);

const Emi = mongoose.model("Emi", EmiSchema);
module.exports = Emi;
