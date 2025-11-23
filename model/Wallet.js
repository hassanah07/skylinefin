const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminWalletSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    txnBy: {
      type: String,
      required: true,
    },
    txnId: {
      type: String,
      required: true,
    },
    txnFor: {
      type: String,
      required: true,
    },
    loanAccountNumber: {
      type: Number,
    },
    txnNo: {
      type: String,
      required: true,
    },
    txnStatus: {
      type: Boolean,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isEmployee: {
      type: Boolean,
      default: false,
    },
    isMarchant: {
      type: Boolean,
      default: false,
    },
    isInvestor: {
      type: Boolean,
      default: false,
    },
    isCustomer: {
      type: Boolean,
      default: false,
    },
    managerApproval: {
      type: Boolean,
      default: false,
    },
    adminApproval: {
      type: Boolean,
      default: false,
    },
    isWithdrawn: {
      type: Boolean,
      default: false,
    },
    isRefund: {
      type: Boolean,
      default: false,
    },
    isCradit: {
      type: Boolean,
      default: false,
    },
    remarks: {
      type: String,
      required: "true",
    },
  },
  { timestamps: true }
);

const AdminWallet = mongoose.model("AdminWallet", AdminWalletSchema);
module.exports = AdminWallet;
