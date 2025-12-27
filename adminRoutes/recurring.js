const express = require("express");
const nodemailer = require("nodemailer");
const fetchAdmin = require("../middleware/fetchAdmin");
const Loan = require("../model/Loan");
const Admin = require("../model/Admin");
const Customer = require("../model/Customer");
const Emi = require("../model/EmiList");
const Recurring = require("../model/Recurring");
const {
  createRecurring,
  updateNextPaymentDate,
  getDuesByRecurringId,
  getFullSchedule,
  paySpecificPayment,
  unpaySpecificPayment,
} = require("../controllers/recurringController");

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
// router.post("/createLoanAccount", fetchAdmin, async (req, res) => {
//   const userId = req.admin.id;
//   try {
//     const operator = await Admin.findById(userId).select("-password");
//     if (!operator._id) {
//       res.status(200).json({ msg: "No Data Found", login: false });
//     } else {
//       const getUser = await Customer.findById(req.body.customerId);
//       if (!getUser._id) {
//         res.status(404).json({ msg: "Loan User Not Found", login: false });
//       } else {
//         let permAddress, permLandmark, permCity, permState, permPIN;
//         if (req.body.presPermAddressSame === true) {
//           permAddress = "";
//           permLandmark = "";
//           permCity = "";
//           permState = "";
//           permPIN = "";
//         } else {
//           permAddress = req.body.permAddressLine;
//           permLandmark = req.body.permLandmark;
//           permCity = req.body.permCity;
//           permState = req.body.permState;
//           permPIN = req.body.permPin;
//         }
//         const receivedData = {
//           loanAccountNumber: Number(
//             ((Date.now() * 2000 + Math.floor(performance.now() * 3000)) % 1e8)
//               .toString()
//               .padStart(10, "0")
//           ),
//           customerId: getUser.customerId,
//           amount: req.body.amount,
//           loanType: req.body.loanType,
//           repaymentPeriod: req.body.repaymentPeriod,
//           interestType: req.body.interestType,
//           interestPercentage: req.body.interestPercentage,
//           stepOne: true,
//           presAddress: req.body.addressLine,
//           presLandmark: req.body.landmark,
//           presCity: req.body.city,
//           presState: req.body.state,
//           presPIN: req.body.pin,
//           altMobile: req.body.altMobile,
//           permAddress: permAddress,
//           permLandmark: permLandmark,
//           permCity: permCity,
//           permState: permState,
//           permPIN: permPIN,
//           finalizedByUser: operator._id,
//           remarks: {
//             remarkerName: operator.name,
//             remarkerid: operator._id,
//             remarkerRole: operator.role,
//             remarkerRemarks: "Created Loan Account",
//           },
//         };
//         // res.json(receivedData);

//         const createLoanAccount = await Loan.create(receivedData);
//         res.status(200).json({
//           msg: "Loan Account Number Created",
//           login: true,
//           status: true,
//           isRedirect: true,
//           createLoanAccount,
//         });
//       }
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .json({ msg: "Internal Server Error", status: false, err: error });
//   }
// });

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
      let getLoanData = await Customer.findOne({
        customerId: req.body.id,
      });
      if (getLoanData === null) {
        res.status(404).json({ msg: "User Not Found", login: false });
      } else {
        const recurringId = Number(
          ((Date.now() * 4000 + Math.floor(performance.now() * 5000)) % 1e8)
            .toString()
            .padStart(8, "0")
        );
        getLoanData = await Recurring.create({
          customerId: req.body.id,
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

        res.json({ msg: "Bingoo!! Saved", login: true });
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
router.post("/save", fetchAdmin, createRecurring);
router.post("/next-payment", fetchAdmin, updateNextPaymentDate);
router.post("/dues", fetchAdmin, getDuesByRecurringId);
router.post("/schedule", getFullSchedule);
router.post("/pay", fetchAdmin, paySpecificPayment);
router.post("/unpay", fetchAdmin, unpaySpecificPayment);

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
