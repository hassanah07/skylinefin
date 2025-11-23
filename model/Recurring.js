const mongoose = require("mongoose");
const { Schema } = mongoose;

const RecurringSchema = new Schema(
  {
    customerId: {
      type: String,
      required: true,
    },
    recurringId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    frequency: {
      type: String,
      required: true,
    },
    cashfree: {
      type: String,
      required: true,
    },
    repaymentPeriod: {
      type: String,
      required: true,
    },
    interestPercentage: {
      type: Number,
      required: true,
    },
    // addressType: {
    //   type: String,
    // },
    // step two
    // present address fields
    presAddress: {
      type: String,
    },
    presLandmark: {
      type: String,
    },
    presPIN: {
      type: String,
    },
    postalData: [],
    altMobile: {
      type: String,
    },
    // permanent address fields
    permAddress: {
      type: String,
    },
    permLandmark: {
      type: String,
    },
    permPIN: {
      type: String,
    },
    permPostalData: [],
    stepI: {
      type: Boolean,
      default: false,
    },
    // bank Details
    bankName: {
      type: String,
    },
    bankBranch: {
      type: String,
    },
    bankIfsc: {
      type: String,
    },
    bankAcNo: {
      type: Number,
    },
    bankAcType: {
      type: String,
    },
    bankCustomerId: {
      type: String,
    },
    processedBy: {
      type: String,
    },
    stepII: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: false,
    },
    adminApproval: {
      type: Boolean,
      default: false,
    },
    processedDate: {
      type: Date,
    },
    remarks: [
      {
        remarkerName: {
          type: String,
        },
        remarkerId: {
          type: String,
        },
        remarkerRole: {
          type: String,
        },
        note: {
          type: String,
        },
      },
      { timestamps: true },
    ],
  },
  { timestamps: true }
);

const Recurring = mongoose.model("Recurring", RecurringSchema);
module.exports = Recurring;
