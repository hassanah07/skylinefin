const express = require("express");
const nodemailer = require("nodemailer");
const fetchAdmin = require("../middleware/fetchAdmin");
const Admin = require("../model/Admin");
const AdminWallet = require("../model/Wallet");
const Loan = require("../model/Loan");
const Customer = require("../model/Customer");
const Emi = require("../model/EmiList");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/txn", fetchAdmin, async (req, res) => {
  const adminId = req.admin.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      await session.abortTransaction();
      return res.status(401).json({ msg: "Please Login Again", login: false });
    }

    // Unique transaction number
    const txnNo = Date.now();

    // Check duplicate transaction
    const existingTxn = await AdminWallet.findOne({ txnNo });
    if (existingTxn) {
      await session.abortTransaction();
      return res
        .status(409)
        .json({ msg: "Transaction Already Done!", status: true });
    }

    /* ================= CUSTOMER EMI PAYMENT ================= */
    if (req.body.isCustomer === true) {
      const { loanAccountNumber, amount, installmentNo, dueDate } = req.body;

      const loan = await Loan.findOne({ loanAccountNumber });
      if (!loan) {
        await session.abortTransaction();
        return res.status(404).json({ msg: "Loan not found" });
      }

      const customer = await Customer.findOne({
        customerId: loan.customerId,
      });

      if (!customer) {
        await session.abortTransaction();
        return res
          .status(404)
          .json({ msg: "Customer not found", status: false });
      }

      // Create wallet transaction
      await AdminWallet.create(
        [
          {
            amount,
            txnBy: adminId,
            txnFor: customer._id,
            loanAccountNumber,
            txnNo,
            txnStatus: true,
            isAdmin: true,
            adminApproval: true,
            isCradit: false,
            isEmi: true,
            remarks: "EMI Collection",
          },
        ],
        { session }
      );

      // Update EMI (prevent double payment)
      const emiUpdate = await Emi.findOneAndUpdate(
        {
          loanAccountNumber,
          "emiPayment.emiNumber": installmentNo.toString(),
          "emiPayment.status": false,
        },
        {
          $set: {
            "emiPayment.$.status": true,
            "emiPayment.$.paidOn": new Date(),
          },
        },
        { new: true, session }
      );

      if (!emiUpdate) {
        await session.abortTransaction();
        return res.status(400).json({ msg: "EMI already paid or not found" });
      }

      await session.commitTransaction();
      session.endSession();

      // -------- SEND EMAIL (ASYNC, NO RESPONSE INSIDE) --------
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAILER_USERID,
          pass: process.env.MAILER_PASSWORD,
        },
      });

      const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial;background:#f7f7f7;padding:20px">
        <div style="max-width:600px;margin:auto;background:#fff;border-radius:8px">
          <div style="background:#0d6efd;color:white;padding:15px;text-align:center">
            <h2>Installment Credited Successfully</h2>
          </div>
          <table style="width:100%;padding:20px">
            <tr><td><b>Amount:</b></td><td>₹${amount}</td></tr>
            <tr><td><b>Installment No:</b></td><td>${installmentNo}</td></tr>
            <tr><td><b>For Month:</b></td>
              <td>${new Date(dueDate).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}</td>
            </tr>
            <tr><td><b>Status:</b></td><td>Paid</td></tr>
            <tr><td><b>Date:</b></td><td>${new Date().toLocaleString()}</td></tr>
          </table>
          <div style="background:#eee;padding:10px;text-align:center;font-size:12px">
            Auto generated email. Do not reply.
          </div>
        </div>
      </body>
      </html>
      `;

      transporter
        .sendMail({
          from: `"Server Mail" <${process.env.MAILER_USERID}>`,
          to: customer.email,
          subject: "Installment Credited",
          html: emailTemplate,
        })
        .catch(console.error);

      return res.status(200).json({
        msg: "Installment Credited Successfully",
        login: true,
        status: true,
      });
    }

    /* ================= NORMAL ADMIN TRANSACTION ================= */
    await AdminWallet.create(
      [
        {
          amount: req.body.amount,
          txnBy: adminId,
          txnFor: req.body.txnFor,
          txnNo,
          txnStatus: true,
          isAdmin: true,
          adminApproval: true,
          isWithdrawn: req.body.isWithdrawn,
          isRefund: req.body.isRefund,
          isCradit: req.body.isCradit,
          remarks: req.body.remarks,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ msg: "Transaction Successful" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});
router.post("/getTxnByLoanAccountNumber", fetchAdmin, async (req, res) => {
  const adminId = req.admin.id;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      // await session.abortTransaction();
      return res.status(401).json({ msg: "Please Login Again", login: false });
    }
    // find Customer Id
    const findCustomerId = await Loan.findOne({
      loanAccountNumber: req.body.loanAccountNumber,
    });
    const customerUid = findCustomerId._id;
    console.log(typeof customerUid);
    const customerId = findCustomerId.customerId;
    // get customer details
    const customer = await Customer.findOne({ customerId: customerId });
    // get loan emi transactions
    const emiTxn = await AdminWallet.find({
      loanAccountNumber: req.body.loanAccountNumber,
    });
    const loanDetails = await Loan.findOne({
      loanAccountNumber: req.body.loanAccountNumber,
    });
    const emis = await Emi.findOne({
      loanAccountNumber: req.body.loanAccountNumber,
    });
    // const txn = await AdminWallet.find({
    //   txnFor: new mongoose.Types.ObjectId(customerUid),
    // });
    res.json({ customer, emiTxn, loanDetails, emis });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
