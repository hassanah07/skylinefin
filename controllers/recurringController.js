const RecurringList = require("../model/RecurrignList");
const { getNextPaymentDate } = require("../utils/dateUtils");

/**
 * @desc   Create recurring collection
 * @route  POST /api/recurring
 */
const createRecurring = async (req, res) => {
  try {
    const {
      customerId,
      recurringId,
      email,
      amount,
      frequency,
      cashfree,
      repaymentPeriod,
      interestPercentage,
      scheduleData,
      startDate,
    } = req.body;

    // Basic validation
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
    const nextPaymentDate = getNextPaymentDate(startDate, frequency);

    const recurring = await RecurringList.create({
      customerId,
      recurringId,
      email,
      amount,
      frequency,
      cashfree,
      repaymentPeriod,
      interestPercentage,
      startDate,
      nextPaymentDate,
      schedule,
    });

    res.status(201).json({
      success: true,
      message: "Recurring created successfully",
      data: recurring,
    });
  } catch (error) {
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
      totalPayments: recurring.recurringPayment.length,
      data: recurring.recurringPayment,
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

    if (!recurring) {
      return res.status(404).json({
        success: false,
        message: "Recurring not found",
      });
    }

    // Find the specific payment
    const payment = recurring.recurringPayment.find(
      (p) => p.recurringNumber === recurringNumber
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

module.exports = {
  createRecurring,
  updateNextPaymentDate,
  getDuesByRecurringId,
  getFullSchedule,
  paySpecificPayment,
};
