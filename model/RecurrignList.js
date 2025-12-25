const mongoose = require("mongoose");
const { Schema } = mongoose;

const ScheduleSchema = new Schema(
  {
    period: { type: Number, required: true },
    payment: { type: Number, required: true },
    interest: { type: Number, required: true },
    balance: { type: Number, required: true },
  },
  { _id: false }
);

const RecurringSchema = new Schema(
  {
    customerId: { type: Number, required: true },
    recurringId: { type: Number, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },

    frequency: {
      type: Number,
      required: true,
      // 1 = monthly, 2 = weekly, 3 = daily (example)
    },

    cashfree: { type: Number, required: true },
    repaymentPeriod: { type: Number, required: true },
    interestPercentage: { type: String, required: true },

    /** ✅ NEW FIELDS **/
    startDate: {
      type: Date,
      required: true,
    },

    nextPaymentDate: {
      type: Date,
      required: true,
      index: true, // useful for cron jobs
    },

    schedule: [ScheduleSchema],

    recurringPayment: [
      {
        recurringNumber: String,
        txnNumber: String,
        month: Number,
        opening: Number,
        recurring: Number,
        principal: Number,
        interest: Number,
        fine: Number,
        closing: Number,
        dueDate: Date,
        status: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecurringList", RecurringSchema);
