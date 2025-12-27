const RecurringList = require("../model/RecurrignList");
const Recurring = require("../model/Recurring");
const { getNextPaymentDate } = require("../utils/dateUtils");

/**
 * @desc   Create recurring collection
 * @route  POST /api/recurring
 */

const createRecurring = async (req, res) => {
  try {
    const {
      // customerId, have to find with recurring id
      recurringId,
      // email,have to find with recurring id
      amount,
      frequency,
      cashfree,
      repaymentPeriod,
      interestPercentage,
      scheduleData,
      startDate,
    } = req.body;

    const findRecurring = await Recurring.findOne({ recurringId: recurringId });
    if (!findRecurring) {
      return res.status(404).json({
        success: false,
        message: "Base recurring record not found",
      });
    }

    // Basic validation
    // console.log(req.body);
    if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Schedule must be a non-empty array",
      });
    }

    if (!startDate || !frequency) {
      return res.status(400).json({
        success: false,
        message: "startDate and frequency are required",
      });
    }

    // ✅ Utility function used here
    const nextPaymentDate = getNextPaymentDate(startDate, Number(frequency));

    const findPrev = await RecurringList.findOne({ recurringId: recurringId });
    // console.log(findPrev);
    const getDueDateByPeriod = (startDate, frequency, period) => {
      const date = new Date(startDate);

      switch (Number(frequency)) {
        case 1: // monthly
          date.setMonth(date.getMonth() + period);
          break;

        case 2: // weekly
          date.setDate(date.getDate() + period * 7);
          break;

        case 3: // daily
          date.setDate(date.getDate() + period);
          break;

        default:
          throw new Error("Invalid frequency");
      }

      return date;
    };
    const recurringPayments = scheduleData.map((row) => ({
      recurringNumber: String(row.period),
      month: row.period,
      opening: row.balance - row.payment,
      recurring: row.payment,
      principal: row.payment,
      interest: row.interest,
      fine: 0,
      closing: row.balance,
      dueDate: getDueDateByPeriod(startDate, frequency, row.period),
      status: false,
    }));
    if (findPrev === null) {
      // console.log(findRecurring);
      const recurring = await RecurringList.create({
        customerId: Number(findRecurring.customerId),
        recurringId,
        email: findRecurring.email,
        amount,
        frequency: Number(frequency),
        cashfree: findRecurring.cashfree,
        repaymentPeriod: findRecurring.repaymentPeriod,
        interestPercentage,
        startDate,
        nextPaymentDate,
        schedule: scheduleData,
        recurringPayment: recurringPayments,
      });

      res.status(201).json({
        success: true,
        msg: "Recurring created successfully",
        data: recurring,
      });
    } else {
      const updatedRecurring = await RecurringList.findOneAndUpdate(
        { recurringId },
        {
          $set: {
            amount,
            frequency: Number(frequency),
            interestPercentage,
            nextPaymentDate,
            schedule: scheduleData,
            // recurringPayment: recurringPayments,
          },
        },
        { new: true }
      );
      res.json({ updatedRecurring, msg: "Updated" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc   Update next payment date after successful payment
 * @route  post /api/recurring/next-payment
 */
const updateNextPaymentDate = async (req, res) => {
  try {
    const { id } = req.body;

    const recurring = await RecurringList.findOne({ customerId: id });
    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: "Recurring not found",
      });
    }

    recurring.nextPaymentDate = getNextPaymentDate(
      recurring.nextPaymentDate,
      recurring.frequency
    );

    await recurring.save();

    res.status(200).json({
      success: true,
      message: "Next payment date updated",
      nextPaymentDate: recurring.nextPaymentDate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * @desc   Get all due payments for a recurring by ID
 * @route  GET /api/recurring/:id/dues
 */
const getDuesByRecurringId = async (req, res) => {
  try {
    const { id } = req.body;

    // Find recurring by ID
    const recurring = await RecurringList.findOne({ recurringId: id });

    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: "Recurring not found",
      });
    }

    // Filter recurringPayment array for dues (status: false)
    const dues = recurring.recurringPayment.filter(
      (payment) => !payment.status
    );

    // Optionally, you can filter by dueDate <= today
    const today = new Date();
    const duePayments = dues.filter((p) => new Date(p.dueDate) <= today);

    res.status(200).json({
      success: true,
      totalDues: duePayments.length,
      data: duePayments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get full schedule (paid & unpaid) for a recurring by ID
 * @route  POST /api/recurring/:id/schedule
 */
const getFullSchedule = async (req, res) => {
  try {
    const { id } = req.body;

    const recurring = await RecurringList.findOne({ recurringId: id });

    if (!recurring) {
      // console.log("first")
      return res.status(404).json({
        success: false,
        message: "Recurring not found",
      });
    }

    // Return the full recurringPayment array
    res.status(200).json({
      success: true,
      data: recurring,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @desc   Mark a specific payment as paid
 * @route  POST /api/recurring/pay
 * @body   { recurringNumber: string, txnNumber: string }
 */
const paySpecificPayment = async (req, res) => {
  try {
    // const { id } = req.body; // recurring document ID
    const { recurringNumber, txnNumber, id } = req.body;

    if (!recurringNumber || !txnNumber) {
      return res.status(400).json({
        success: false,
        message: "recurringNumber and txnNumber are required",
      });
    }

    const recurring = await RecurringList.findOne({ recurringId: id });
    // console.log(recurring);
    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: "Recurring not found",
      });
    }

    // Find the specific payment
    const payment = recurring.recurringPayment.find(
      (p) => p.recurringNumber === String(recurringNumber)
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status) {
      return res.status(400).json({
        success: false,
        message: "Payment already marked as paid",
      });
    }

    // Update payment
    payment.status = true;
    payment.txnNumber = txnNumber;
    payment.paymentDate = new Date(); // optional, can add field in schema

    await recurring.save();

    res.status(200).json({
      success: true,
      message: `Payment ${recurringNumber} marked as paid`,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const payRecurringInstallment = async (req, res) => {
  try {
    const { id, recurringNumber, txnNumber, amount } = req.body;

    if (!id || !recurringNumber || !txnNumber) {
      return res.status(400).json({
        success: false,
        message: "id, recurringNumber and txnNumber are required",
      });
    }

    const recurring = await RecurringList.findOne({ recurringId: id });

    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: "Recurring not found",
      });
    }

    // 🔍 Find installment
    const payment = recurring.recurringPayment.find(
      (p) => String(p.recurringNumber) === String(recurringNumber)
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Installment not found",
      });
    }

    if (payment.status) {
      return res.status(400).json({
        success: false,
        message: "Already paid",
      });
    }

    // ✅ Update fields
    payment.status = true;
    payment.txnNumber = txnNumber;
    payment.paymentDate = new Date();

    if (amount) {
      payment.recurring = amount;
    }

    await recurring.save();

    res.status(200).json({
      success: true,
      message: "Installment marked as paid",
      data: payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const unpaySpecificPayment = async (req, res) => {
  try {
    const { id, recurringNumber } = req.body;

    if (!id || !recurringNumber) {
      return res.status(400).json({
        success: false,
        message: "id and recurringNumber are required",
      });
    }

    const recurring = await RecurringList.findOne({ recurringId: id });

    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: "Recurring not found",
      });
    }

    const payment = recurring.recurringPayment.find(
      (p) => p.recurringNumber === String(recurringNumber)
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (!payment.status) {
      return res.status(400).json({
        success: false,
        message: "Payment is already unpaid",
      });
    }

    // 🔄 rollback payment
    payment.status = false;
    payment.txnNumber = null;
    payment.paymentDate = null;

    await recurring.save();

    res.status(200).json({
      success: true,
      message: `Payment ${recurringNumber} marked as unpaid`,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRecurring,
  updateNextPaymentDate,
  getDuesByRecurringId,
  getFullSchedule,
  paySpecificPayment,
  payRecurringInstallment,
  unpaySpecificPayment,
};
