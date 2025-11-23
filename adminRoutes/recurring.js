const express = require("express");
const nodemailer = require("nodemailer");
const fetchAdmin = require("../middleware/fetchAdmin");
const Loan = require("../model/Loan");
const Admin = require("../model/Admin");
const Customer = require("../model/Customer");
const Emi = require("../model/EmiList");
const Recurring = require("../model/Recurring");

const router = express.Router();

// initial check by mobile number
router.post("/checkuser", async (req, res) => {
  try {
    let checkUser = await Loan.findOne({ mobile: req.body.mobile });
    if (checkUser) {
      res.status(201).json({ msg: "User Already Exists", status: false });
    } else if (!checkUser) {
      res.status(200).json({ msg: "Redirecting", status: true });
    }
  } catch (error) {
    return (
      res.status(500).json * { msg: "Internal Server Error", status: false }
    );
  }
});
// get recurring user All
router.post("/getRecurringUsers", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const operator = await Admin.findById(userId).select("-password");
    if (!operator._id) {
      res.status(200).json({ msg: "Access Denied", login: false });
    } else {
      const getUser = await Recurring.find();
      res.status(200).json({ getUser, login: true });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", login: false });
  }
});
router.post("/createLoanAccount", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const operator = await Admin.findById(userId).select("-password");
    if (!operator._id) {
      res.status(200).json({ msg: "No Data Found", login: false });
    } else {
      const getUser = await Customer.findById(req.body.customerId);
      if (!getUser._id) {
        res.status(404).json({ msg: "Loan User Not Found", login: false });
      } else {
        let permAddress, permLandmark, permCity, permState, permPIN;
        if (req.body.presPermAddressSame === true) {
          permAddress = "";
          permLandmark = "";
          permCity = "";
          permState = "";
          permPIN = "";
        } else {
          permAddress = req.body.permAddressLine;
          permLandmark = req.body.permLandmark;
          permCity = req.body.permCity;
          permState = req.body.permState;
          permPIN = req.body.permPin;
        }
        const receivedData = {
          loanAccountNumber: Number(
            ((Date.now() * 2000 + Math.floor(performance.now() * 3000)) % 1e8)
              .toString()
              .padStart(10, "0")
          ),
          customerId: getUser.customerId,
          amount: req.body.amount,
          loanType: req.body.loanType,
          repaymentPeriod: req.body.repaymentPeriod,
          interestType: req.body.interestType,
          interestPercentage: req.body.interestPercentage,
          stepOne: true,
          presAddress: req.body.addressLine,
          presLandmark: req.body.landmark,
          presCity: req.body.city,
          presState: req.body.state,
          presPIN: req.body.pin,
          altMobile: req.body.altMobile,
          permAddress: permAddress,
          permLandmark: permLandmark,
          permCity: permCity,
          permState: permState,
          permPIN: permPIN,
          finalizedByUser: operator._id,
          remarks: {
            remarkerName: operator.name,
            remarkerid: operator._id,
            remarkerRole: operator.role,
            remarkerRemarks: "Created Loan Account",
          },
        };
        // res.json(receivedData);

        const createLoanAccount = await Loan.create(receivedData);
        res.status(200).json({
          msg: "Loan Account Number Created",
          login: true,
          status: true,
          isRedirect: true,
          createLoanAccount,
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server Error", status: false, err: error });
  }
});
router.post("/getCustomerRecurring", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const data = await Loan.find({ customerId: req.body.customerId });
    res.status(200).json({ login: true, status: true, data: data });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server Error", status: false, err: error });
  }
});
// generate loan delation otp
router.post("/generateotptoDelete", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    let admin = await Admin.findById(userId);
    if (admin === null) {
      return res.status(400).json({ msg: "Access Denied", type: "error" });
    }
    const otpId = Math.floor(10000 + Math.random() * 500000).toString();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 2 * 60 * 1000;
    // admin.otp = otp;
    // admin.otpExpiry = otpExpiry;

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
      async function main() {
        const info = await transporter.sendMail({
          from: '"Server Mail"servermail@noreply.com',
          to: "noreply.skylinee@gmail.com",
          subject: `Loan Account Delation OTP with OTP ID: ${otpId} ✔`,
          html: `
        <h2><b>Hello Admin! Here is your OTP to delete a Loan Account. OTP will valid for two (02) Minutes</b></h2>
        <b>OTP :</b><b><u>${otp}</u></b><br />
        <small>This is an auto generated email for Extra security</small>
        `,
        });

        const loanOtp = await Loan.findByIdAndUpdate(req.body.id, {
          $set: {
            otp: otp,
            otpExpiry: otpExpiry,
          },
        });
        res.status(200).json({
          msg: "OTP Has Been Sent to Admin Email ID",
          type: "success",
          status: true,
          login: true,
          id: loanOtp._id,
          otp: loanOtp.otp,
          otpExpiry: loanOtp.otpExpiry,
        });
      }
      main().catch((error) => {
        res.status(500).json({ msg: "Unable To Send Email", type: "error" });
      });
    } catch (error) {
      res.status(500).json({ msg: "E-Mail Server Error", type: "error" });
    }
    // email shotting process end
  } catch (error) {
    res.json({ msg: "Contact Developer", type: "error" });
  }
});
router.post("/otpVerify", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    let admin = await Admin.findById(userId);
    if (admin === null) {
      return res.status(400).json({
        msg: "Access Denied",
        type: "error",
        status: false,
        login: false,
      });
    }
    let loanVerify = await Loan.findById(req.body.id);
    if (parseInt(req.body.otp) !== parseInt(loanVerify.otp)) {
      res.status(400).json({ msg: "Invalid OTP", status: false });
    } else if (loanVerify.otpExpiry < Date.now()) {
      res.status(400).json({ msg: "OTP Expired", status: false });
    } else {
      loanVerify = await Loan.findByIdAndDelete(req.body.id);
      res.status(200).json({
        msg: "Loan Account Has Been Deleted",
        status: true,
        login: true,
      });
    }
  } catch {
    return res.status(500).send("Internal Server Error");
  }
});
// create recurring Id
router.post("/StepI", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const operator = await Admin.findById(userId).select("-password");
    if (!operator._id) {
      res.status(200).json({ msg: "Please Login Again", login: false });
    } else {
      let getLoanData = await Customer.findById(req.body.id);
      if (getLoanData === null) {
        res.status(404).json({ msg: "User Not Found", login: false });
      } else {
        const recurringId = Number(
          ((Date.now() * 4000 + Math.floor(performance.now() * 5000)) % 1e8)
            .toString()
            .padStart(8, "0")
        );
        // email shotting process start
        const postalData = req.body.postalData;
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
          async function main() {
            const info = await transporter.sendMail({
              from: '"Server Mail"servermail@noreply.com',
              to: `${getLoanData.email}`,
              subject: `New Recurring Account Acreated`,
              html: `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      @media only screen and (max-width:600px) {
        .container { width: 100% !important; }
        .stack { display: block !important; width: 100% !important; }
        .pad-sm { padding: 16px !important; }
        .text-center { text-align: center !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f6f8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table width="600" class="container" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.06);">
            <tr>
              <td style="background:linear-gradient(90deg,#3b82f6,#06b6d4);padding:20px;text-align:center;color:#ffffff;font-size:18px;font-weight:600;">
                🏦 Recurring Account Created Successfully
              </td>
            </tr>

            <tr>
              <td style="padding:24px;">
                <h2 style="margin-top:0;color:#0f172a;">Congratulations Dear Customer 🎉</h2>
                <p style="color:#475569;font-size:15px;line-height:1.6;">
                  Your recurring account has been successfully created. Below are your account details:
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;margin-top:12px;">
                  <tr style="background:#f8fafc;">
                    <td style="padding:10px 14px;font-weight:600;color:#334155;">Recurring ID</td>
                    <td style="padding:10px 14px;color:#0f172a;">${recurringId}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 14px;font-weight:600;color:#334155;">Amount</td>
                    <td style="padding:10px 14px;color:#0f172a;">₹${
                      req.body.amount
                    }</td>
                  </tr>
                  <tr style="background:#f8fafc;">
                    <td style="padding:10px 14px;font-weight:600;color:#334155;">Frequency</td>
                    <td style="padding:10px 14px;color:#0f172a;">${
                      req.body.frequency
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 14px;font-weight:600;color:#334155;">Repayment Period</td>
                    <td style="padding:10px 14px;color:#0f172a;">${
                      req.body.repaymentPeriod
                    }</td>
                  </tr>
                  <tr style="background:#f8fafc;">
                    <td style="padding:10px 14px;font-weight:600;color:#334155;">Interest Rate</td>
                    <td style="padding:10px 14px;color:#0f172a;">${
                      req.body.interestPercentage
                    }%</td>
                  </tr>
                </table>

                <p style="margin-top:18px;font-size:14px;color:#475569;">
                  <strong><u>Address:</u></strong><br />
                  ${req.body.addressLine}, ${req.body.landmark}, 
                </p>
                <span style="font-size:14px;color:#475569;">
                  <strong>Potstal Data</strong><br />
                  Post Office: ${postalData.Name}<br>
                  Circle: ${postalData.Circle}<br>
                  Dist.:${postalData.District}<br>
                  Division:${postalData.Division}<br>
                  Block:${postalData.Block}<br>
                  State:${postalData.State}<br>
                  Country:${postalData.Country}<br>
                  Pincode:${postalData.Pincode}
                </span>

                <div style="text-align:center;margin-top:24px;">
                  <a href="#"
                    style="display:inline-block;background:#0ea5a4;color:#ffffff;padding:12px 20px;text-decoration:none;border-radius:6px;font-weight:600;">
                    View in Dashboard
                  </a>
                </div>

                <p style="margin-top:24px;font-size:12px;color:#94a3b8;line-height:1.5;text-align:center;">
                  This is an automated message, please do not reply.<br>
                  © ${new Date().getFullYear()} Skyline Fynum Small Finance PVT LTD. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
            });
            getLoanData = await Recurring.create({
              customerId: getLoanData.customerId,
              recurringId: recurringId,
              email: getLoanData.email,
              amount: parseInt(req.body.amount),
              frequency: req.body.frequency,
              cashfree: req.body.cashfree,
              repaymentPeriod: req.body.repaymentPeriod,
              interestPercentage: parseInt(req.body.interestPercentage),
              presAddress: req.body.address,
              presLandmark: req.body.landmark,
              presPin: req.body.pin,
              postalData: req.body.postalData,
              permLandmark: req.body.permLandmark,
              permPIN: req.body.permPIN,
              permPostalData: req.body.permPostalData,
              remarks: {
                remarkerName: operator.name,
                remarkerId: operator._id,
                remarkerRole: "Admin",
                remarkerRole: "Recurring Processed",
              },
            });
            res.json({ msg: "Save and Sent to Customer", login: true });
          }
          main().catch((error) => {
            res.json({
              msg: "Unable To Send Email",
              type: "error",
              login: true,
            });
          });
        } catch (error) {
          res
            .status(500)
            .json({ msg: "E-Mail Server Error", type: "error", login: true });
        }
        // email shotting process end
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server Error", login: false, err: error });
  }
});
// Update Recurring Id
router.post("/StepIv2", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const operator = await Admin.findById(userId).select("-password");
    if (!operator._id) {
      res.status(200).json({ msg: "No Data Found", login: false });
    } else {
      let getLoanData = await Loan.findById(req.body.id);
      if (getLoanData === null) {
        res.status(404).json({ msg: "Loan User Not Found", login: false });
      } else {
        getLoanData = await Loan.findByIdAndUpdate(req.body.id, {
          $push: {
            remarks: {
              $each: [
                {
                  remarkerName: operator.name,
                  remarkerid: operator._id,
                  remarkerRole: operator.role,
                  remarkerRemarks: "Step 1 V2.0 Has been Updated",
                },
              ],
            },
          },
          $set: {
            amount: req.body.amount,
            loanType: req.body.loanType,
            repaymentPeriod: req.body.repaymentPeriod,
            interestType: req.body.interestType,
            interestPercentage: req.body.interestPercentage,
            presAddress: req.body.addressLine,
            presLandmark: req.body.landmark,
            presCity: req.body.city,
            presState: req.body.state,
            presPIN: req.body.pin,
            altMobile: req.body.altMobile,
            presParmAddressSame: req.body.presParmAddressSame,
            permAddress: req.body.permAddressLine,
            permLandmark: req.body.permLandmark,
            permCity: req.body.permCity,
            permState: req.body.permState,
            permPIN: req.body.permPin,
          },
        });

        res.status(200).json({
          msg: "Step I has been Updated",
          login: true,
          status: true,
          isRedirect: true,
          getLoanData,
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server Error", status: false, err: error });
  }
});
// bank account addition
router.post("/StepII", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const operator = await Admin.findById(userId).select("-password");
    if (!operator._id) {
      res.status(200).json({ msg: "No Data Found", login: false });
    } else {
      let getLoanData = await Loan.findById(req.body.id);
      if (getLoanData === null) {
        res.status(404).json({ msg: "Loan User Not Found", login: false });
      } else {
        let isCompany,
          companyName,
          companyAddress,
          companyState,
          companyCity,
          companyPIN,
          yearofIncorporation,
          cinNo,
          companyPanNo,
          companyGst,
          companyEffDate,
          officeEmail,
          officePhone,
          stepTwo,
          stepThree;
        if (req.body.isCompany === false) {
          isCompany = false;
          companyName = "";
          companyAddress = "";
          companyState = "";
          companyCity = "";
          companyPIN = "";
          yearofIncorporation = "";
          cinNo = "";
          companyPanNo = "";
          companyGst = "";
          companyEffDate = "";
          officePhone = "";
          officeEmail = "";
          stepTwo = true;
          stepThree = true;
        } else {
          isCompany = true;
          companyName = req.body.companyName;
          companyAddress = req.body.companyAddress;
          companyState = req.body.companyState;
          companyCity = req.body.companyCity;
          companyPIN = req.body.companyPin;
          yearofIncorporation = req.body.yearofIncorporation;
          cinNo = req.body.cinNo;
          companyPanNo = req.body.companyPanNo;
          companyGst = req.body.companyGst;
          companyEffDate = req.body.companyEffDate;
          officePhone = req.body.officePhone;
          officeEmail = req.body.officeEmail;
          stepTwo = true;
          stepThree = false;
        }
        const receivedData = {
          isCompany,
          companyName,
          companyAddress,
          companyState,
          companyCity,
          companyPIN,
          yearofIncorporation,
          cinNo,
          companyPanNo,
          companyGst,
          companyEffDate,
          officeEmail,
          officePhone,
          stepTwo,
          stepThree,
        };
        getLoanData = await Loan.findByIdAndUpdate(req.body.id, {
          $push: {
            remarks: {
              $each: [
                {
                  remarkerName: operator.name,
                  remarkerid: operator._id,
                  remarkerRole: operator.role,
                  remarkerRemarks: "Step 2 Company Details Has been Updated",
                },
              ],
            },
          },
          $set: receivedData,
        });

        res.status(200).json({
          msg: "Loan Account Updated",
          login: true,
          status: true,
          isRedirect: true,
          getLoanData,
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server Error", status: false, err: error });
  }
});
// payment setup
router.post("/StepIII", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const operator = await Admin.findById(userId).select("-password");
    if (!operator._id) {
      res.status(200).json({ msg: "No Data Found", login: false });
    } else {
      let getLoanData = await Loan.findById(req.body.id);
      if (getLoanData === null) {
        res.status(404).json({ msg: "Loan User Not Found", login: false });
      } else {
        getLoanData = await Loan.findByIdAndUpdate(req.body.id, {
          $push: {
            companyPartnerDetails: {
              $each: [
                {
                  partnerName: req.body.partnerName,
                  partnerPan: req.body.partnerPan,
                  profitShare: req.body.profitShare,
                  partnerDob: req.body.partnerDob,
                  partnerMobile: req.body.partnerMobile,
                  partnerEmail: req.body.partnerEmail,
                  dinNo: req.body.dinNo,
                },
              ],
            },
            remarks: {
              $each: [
                {
                  remarkerName: operator.name,
                  remarkerid: operator._id,
                  remarkerRole: operator.role,
                  remarkerRemarks: "Step 3 Has been Updated",
                },
              ],
            },
          },
          $set: {
            stepThree: true,
          },
        });

        res.status(200).json({
          msg: "Director Added!",
          login: true,
          status: true,
          isRedirect: true,
          getLoanData,
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server Error", status: false, err: error });
  }
});
// Final Approval By Admin
router.post("/StepIV", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const operator = await Admin.findById(userId).select("-password");
    if (!operator._id) {
      res.status(200).json({ msg: "No Data Found", login: false });
    } else {
      let getLoanData = await Loan.findById(req.body.id);
      if (getLoanData === null) {
        res.status(404).json({ msg: "Loan User Not Found", login: false });
      } else {
        getLoanData = await Loan.findByIdAndUpdate(req.body.id, {
          $push: {
            companyPartnerDetails: {
              $each: [
                {
                  partnerName: req.body.partnerName,
                  partnerPan: req.body.partnerPan,
                  profitShare: req.body.profitShare,
                  partnerDob: req.body.partnerDob,
                  partnerMobile: req.body.partnerMobile,
                  partnerEmail: req.body.partnerEmail,
                  dinNo: req.body.dinNo,
                },
              ],
            },
            remarks: {
              $each: [
                {
                  remarkerName: operator.name,
                  remarkerid: operator._id,
                  remarkerRole: operator.role,
                  remarkerRemarks: "Step 3 Has been Updated",
                },
              ],
            },
          },
          $set: {
            stepThree: true,
          },
        });

        res.status(200).json({
          msg: "Director Added!",
          login: true,
          status: true,
          isRedirect: true,
          getLoanData,
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server Error", status: false, err: error });
  }
});

// send and Save emi data: to users email id and save & update EMI Data to Database
router.post("/sendEmail", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  // console.log(req.body);
  try {
    let admin = await Admin.findById(userId);
    if (admin === null) {
      return res.status(400).json({
        msg: "Access Denied",
        type: "error",
        status: false,
        login: false,
      });
    }
    // lets find customerid from Loan
    const findCustomerId = await Loan.findOne({
      loanAccountNumber: req.body.loanAccountNumber,
    });
    const customerId = findCustomerId.customerId;

    // lets Get Email Id from customer table
    const getEmailId = await Customer.findOne({
      customerId: findCustomerId.customerId,
    });
    // console.log(getEmailId.email);

    // const loanUser = await Customer.findOne({
    //   loanAccountNumber: req.body.loanAccountNumber,
    // });
    if (getEmailId.email) {
      const emiData = req.body.data;
      try {
        const transporter = nodemailer.createTransport({
          // host: "smtp.forwardemail.net",
          // port: 465,
          // secure: true,
          service: "gmail",
          auth: {
            user: process.env.MAILER_USERID,
            pass: process.env.MAILER_PASSWORD,
          },
        });
        // extract totals start
        const totalPrincipal = emiData.reduce(
          (sum, item) => sum + item.principal,
          0
        );
        const totalInterest = emiData.reduce(
          (sum, item) => sum + item.interest,
          0
        );
        const netPayable = totalPrincipal + totalInterest;
        // extract totals end
        // Generate the HTML table from emiData array
        const tableRows = emiData
          .map(
            (row, index) => `
        <tr>
          <td style="border:1px solid #ddd; padding:8px;">${index + 1}</td>
          <td style="border:1px solid #ddd; padding:8px;">${index + 1}</td>
          <td style="border:1px solid #ddd; padding:8px;">₹${row.opening.toLocaleString(
            "en-IN"
          )}</td>
          <td style="border:1px solid #ddd; padding:8px;">₹${row.emi.toLocaleString(
            "en-IN"
          )}</td>
          <td style="border:1px solid #ddd; padding:8px;">₹${row.principal.toLocaleString(
            "en-IN"
          )}</td>
          <td style="border:1px solid #ddd; padding:8px;">₹${row.interest.toLocaleString(
            "en-IN"
          )}</td>
          <td style="border:1px solid #ddd; padding:8px;">₹${row.closing.toLocaleString(
            "en-IN"
          )}</td>
        </tr>
      `
          )
          .join("");

        const totalsRow = `
    <tr style="background:#f2f2f2; font-weight:bold;">
      <td colspan="4" style="border:1px solid #ddd; padding:8px; text-align:right;">Totals</td>
      <td style="border:1px solid #ddd; padding:8px;">₹${totalPrincipal.toLocaleString(
        "en-IN"
      )}</td>
      <td style="border:1px solid #ddd; padding:8px;">₹${totalInterest.toLocaleString(
        "en-IN"
      )}</td>
      <td style="border:1px solid #ddd; padding:8px;">₹${netPayable.toLocaleString(
        "en-IN"
      )}</td>
    </tr>
  `;
        const htmlBody = `
    <div style="font-family:Arial,Helvetica,sans-serif; background:#f9f9f9; padding:20px;">
      <div style="max-width:700px; margin:auto; background:white; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.1); overflow:hidden;">
        <div style="background:#007BFF; color:white; padding:15px; text-align:center;">
          <h2>Loan Amortization Schedule</h2>
        </div>

        <div style="padding:20px;">
          <table style="border-collapse:collapse; width:100%; font-size:14px;">
            <thead>
              <tr style="background:#f2f2f2;">
                <th style="border:1px solid #ddd; padding:8px;">#</th>
                <th style="border:1px solid #ddd; padding:8px;">Month</th>
                <th style="border:1px solid #ddd; padding:8px;">Opening</th>
                <th style="border:1px solid #ddd; padding:8px;">EMI</th>
                <th style="border:1px solid #ddd; padding:8px;">Principal</th>
                <th style="border:1px solid #ddd; padding:8px;">Interest</th>
                <th style="border:1px solid #ddd; padding:8px;">Closing</th>
              </tr>
            </thead>
            <tbody>
             ${tableRows}
              ${totalsRow}
            </tbody>
          </table>
        </div>

        <div style="padding:15px; text-align:center; background:#fafafa; color:#666;">
          <p>Thank you for choosing our loan services.</p>
          <p style="font-size:12px;">This is an automated email, please do not reply.</p>
        </div>
      </div>
    </div>
  `;

        // Send email
        const info = await transporter.sendMail({
          from: '"Server Mail" <servermail@noreply.com>',
          to: getEmailId.email,
          subject: `Loan Amortization Detail`,
          html: htmlBody,
        });
        let saveCustomerEmi = await Emi.findOne({
          loanAccountNumber: req.body.loanAccountNumber,
        });
        if (!saveCustomerEmi) {
          saveCustomerEmi = await Emi.create({
            loanAccountNumber: req.body.loanAccountNumber,
            customerId: customerId,
            loanAmount: totalPrincipal,
            interest: req.body.interest,
            tenure: req.body.tenure,
            totalInterest: totalInterest,
            payableAmount: netPayable,
            type: req.body.type,
            schedule: emiData,
          });
          res.status(200).json({ msg: "EMI Data Saved and Sent" });
        } else {
          saveCustomerEmi = await Emi.findOneAndUpdate(
            { loanAccountNumber: req.body.loanAccountNumber },
            {
              $set: {
                loanAmount: totalPrincipal,
                interest: req.body.interest,
                tenure: req.body.tenure,
                totalInterest: totalInterest,
                payableAmount: netPayable,
                type: req.body.type,
                schedule: emiData,
              },
            }
          );
          res.status(200).json({ msg: "EMI Data Updated and Sent" });
        }
      } catch (error) {
        console.error("Mail Error:", error);
        res.status(500).json({ msg: "Unable To Send Email", type: "error" });
      }
    } else {
      res
        .status(500)
        .json({ msg: "Access Denied", login: false, status: false });
    }
  } catch {
    return res.status(500).send("Internal Server Error");
  }
});
// get EMI Data from DATABASE
router.post("/getCustomerAmortizationData", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    let admin = await Admin.findById(userId);
    if (admin === null) {
      return res.status(400).json({
        msg: "Access Denied",
        type: "error",
        status: false,
        login: false,
      });
    }
    let getData = await Emi.findOne({
      loanAccountNumber: req.body.loanAccountNumber,
    });
    console.log(getData); // getting data
    res.json({ data: getData, status: true }); // getting corse error
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Unavailable", type: "error" });
  }
});

module.exports = router;
