const mongoose = require("mongoose");
const { Schema } = mongoose;

const RecurringSchema = new Schema(
  {
    customerId: {
      type: Number,
      required: true,
    },
    recurringId: {
      type: Number,
      required: true,
    },
    email: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    frequency: {
      type: Number,
      required: true,
    },
    cashfree: {
      type: Number,
      required: true,
    },
    repaymentPeriod: {
      type: Number,
      required: true,
    },
    interestPercentage: {
      type: String,
      required: true,
    },
    schedule: [],
    recurringPayment: [
      {
        recurringNumber: { type: String },
        txnNumber: { type: String },
        month: { type: Number },
        opening: { type: Number },
        recurring: { type: Number },
        principal: { type: Number },
        interest: { type: Number },
        fine: { type: Number },
        closing: { type: Number },
        dueDate: { type: String },
        status: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

const Recurring = mongoose.model("Recurring", RecurringSchema);
module.exports = Emi;
