const express = require("express");
const nodemailer = require("nodemailer");
const fetchAdmin = require("../middleware/fetchAdmin");
const Admin = require("../model/Admin");
const AdminWallet = require("../model/Wallet");
const Loan = require("../model/Loan");
const Customer = require("../model/Customer");
const Emi = require("../model/EmiList");

const router = express.Router();

router.post("/txn", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const auth = await Admin.findById(userId);
    if (!auth) {
      res.json({ msg: "Please Login Again", login: false });
    } else {
      const txnNo = Math.floor(Math.random() * 10000000);
      let cradit = await AdminWallet.findOne({ txnNo: txnNo });
      if (!cradit) {
        if (req.body.isCustomer === true) {
          cradit = await Loan.findOne({
            loanAccountNumber: req.body.loanAccountNumber,
          });
          const customerData = await Customer.findOne({
            customerId: cradit.customerId,
          });
          cradit = await AdminWallet.create({
            amount: req.body.amount,
            txnBy: userId,
            txnFor: customerData._id,
            txnId: customerData._id, //have to remove later from here and Module also
            loanAccountNumber: req.body.loanAccountNumber,
            txnNo: txnNo,
            txnStatus: true,
            isAdmin: true,
            adminApproval: true,
            isCradit: false,
            isEmi: true,
            remarks: "EMI Collection",
          });

          cradit = await Emi.findOneAndUpdate(
            { loanAccountNumber: req.body.loanAccountNumber },
            {
              $set: {
                "emiPayment.$[emi].status": true,
                "emiPayment.$[emi].paidOn": new Date().toLocaleString(),
              },
            },
            {
              arrayFilters: [
                { "emi.emiNumber": req.body.installmentNo.toString() },
              ],
            }
          );
          // email shotting process start
          try {
            const transporter = nodemailer.createTransport({
              host: "smtp.forwardemail.net",
              port: 465,
              secure: true,
              service: "gmail",
              auth: {
                user: process.env.MAILER_USERID,
                pass: process.env.MAILER_PASSWORD,
              },
            });
            const emailTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Installment Credited</title>

    <style>
      body { background:#f7f7f7; font-family:Arial; padding:0; margin:0; }
      .container { max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden; }
      .header { background:#0d6efd; padding:20px; text-align:center; color:white; }
      .header img { width:130px; margin-bottom:10px; }
      table { width:100%; padding:20px; border-collapse:collapse; }
      td { padding:12px; border-bottom:1px solid #ddd; font-size:15px; }
      .label { font-weight:bold; color:#444; }
      .value { font-weight:bold; }
      .footer { background:#eee; padding:12px; text-align:center; font-size:12px; color:#666 }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhZWR81EAPLK-3YRd5Yt74pcrtCAICSr6U_CaHMhxBiV26lnoJctMGMprDReFMxoMUHCIe3fe_mXWys90NGTlrbhNkQyLbLxjwa52d7YqBoWdEKjdj4EHOxG51eWE65VdjB4mf1h4IsbKhoqwtEhHOg9npB-JMlcTYUSZGmzXqa_JzNZXU2CSscQJdkZsA/s1600/2.png" />
        <h2>Installment Credited Successfully</h2>
      </div>

      <table>
        <tr>
          <td class="label">Installment Amount:</td>
          <td class="value">₹${req.body.amount}</td>
        </tr>

        <tr>
          <td class="label">Installment No:</td>
          <td class="value">${req.body.installmentNoAa}</td>
        </tr>

        <tr>
          <td class="label">For the Month of:</td>
          <td class="value">
            ${new Date(req.body.dueDate).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </td>
        </tr>
        <tr>
          <td class="label">Due Date:</td>
          <td class="value">
            ${req.body.dueDate}
          </td>
        </tr>
        <tr>
          <td class="label">Payment Status:</td>
          <td class="value">
          Paid
          </td>
        </tr>

        <tr>
          <td class="label">Transaction Date:</td>
          <td class="value">${new Date().toLocaleString()}</td>
        </tr>
      </table>

      <div class="footer">
        This is an auto-generated email. Please do not reply.
      </div>
    </div>
  </body>
  </html>
  `;
            async function main() {
              const info = await transporter.sendMail({
                from: '"Server Mail"servermail@noreply.com',
                to: customerData.email,
                subject: `Installment Cradited`,
                html: emailTemplate,
              });
              res.status(200).json({
                msg: "Installment Cradited",
                login: true,
              });
            }
            main().catch((error) => {
              res
                .status(500)
                .json({ msg: "Unable To Send Email", type: "error" });
            });
          } catch (error) {
            res.status(500).json({ msg: "E-Mail Server Error", type: "error" });
          }
          // email shotting process end
        } else {
          cradit = await AdminWallet.create({
            amount: req.body.amount,
            txnBy: userId,
            txnFor: req.body.txnFor,
            txnNo: txnNo,
            txnStatus: true,
            isAdmin: true,
            adminApproval: true,
            isWithdrawn: req.body.isWithdrawn,
            isRefund: req.body.isRefund,
            isCradit: req.body.isCradit,
            remarks: req.body.remarks,
          });
          res.json({ msg: "Transaction Successful" });
        }
      } else {
        res.json({ msg: "Transaction Already Done!" });
      }
    }
  } catch (error) {
    console.log([error]);
    res.status(500).json("Internal Server Error", error);
  }
});

module.exports = router;
