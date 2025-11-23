const express = require("express");
const nodemailer = require("nodemailer");
const fetchAdmin = require("../middleware/fetchAdmin");
const Loan = require("../model/Loan");
const Admin = require("../model/Admin");
const Customer = require("../model/Customer");
const Emi = require("../model/EmiList");

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
// create loan user
router.post("/createLoanUser", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const operator = await Admin.findById(userId).select("-password");
    if (operator._id) {
      let newLoanUser = await Customer.findOne({ mobile: req.body.mobile });
      if (newLoanUser) {
        res.status(200).json({
          msg: "Already A Loan User",
          status: false,
          data: newLoanUser._id,
        });
      } else {
        const randId = Math.floor(10000 + Math.random() * 500000).toString();
        const customerId = Number(
          ((Date.now() * 4000 + Math.floor(performance.now() * 5000)) % 1e8)
            .toString()
            .padStart(8, "0")
        );

        //   email shotting process start
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
              to: `noreply.skylinee@gmail.com`,
              cc: req.body.email,
              subject: `You Have a New Lead for a Loan with random ID: ${randId} ✔`,
              html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">

          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">New Loan Lead Notification</h2>
            <p style="margin: 0;">Lead ID: <b>${randId}</b></p>
          </div>

          <div style="padding: 25px; color: #333;">
            <p>Hello:,</p>
            <p>You have received a new loan application. Below are the details:</p>

            <table width="100%" cellpadding="8" style="border-collapse: collapse; margin-top: 10px;">
            <tr style="background-color: #f9fafb;">
                <td><b>Customer ID</b></td>
                <td>${customerId}</td>
              </tr>
              <tr>
                <td><b>Customer Name</b></td>
                <td>${req.body.fullName}</td>
              </tr>
              <tr>
                <td><b>Father's Name</b></td>
                <td>${req.body.fatherName}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td><b>Mobile Number</b></td>
                <td>${req.body.mobile}</td>
              </tr>
              <tr>
                <td><b>Email ID</b></td>
                <td>${req.body.email}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td><b>Repayment Period</b></td>
                <td>${req.body.repaymentPeriod} Months</td>
              </tr>
              <tr>
                <td><b>Loan Amount</b></td>
                <td>₹${req.body.amount}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td><b>Loan Type</b></td>
                <td>${req.body.loanType}</td>
              </tr>
              <tr>
                <td><b>Interest Type</b></td>
                <td>${req.body.interestType}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td><b>Interest Percentage</b></td>
                <td>${req.body.interestPercentage}%</td>
              </tr>
            </table>

            <p style="margin-top: 20px;">Please review the lead details at your earliest convenience.</p>
            <p style="color: #666; font-size: 13px; text-align: center; margin-top: 30px;">
              — This is an automated message from the Server Mail Service —
            </p>
          </div>
        </div>
      </div>
            `,
            });
            newLoanUser = await Customer.create({
              occuType: req.body.occuType,
              customerId: customerId,
              empType: req.body.empType,
              orgType: req.body.orgType,
              BussType: req.body.BussType,
              commuType: req.body.commuType,
              gstNo: req.body.gstNo,
              fullName: req.body.fullName,
              fatherName: req.body.fatherName,
              motherName: req.body.motherName,
              spouseName: req.body.spouseName,
              dob: req.body.dob,
              dependentNo: req.body.dependentNo,
              religion: req.body.religion,
              gender: req.body.gender,
              education: req.body.education,
              passport: req.body.passport,
              passportExp: req.body.passportExp,
              driving: req.body.driving,
              drivingExp: req.body.drivingExp,
              pan: req.body.pan,
              aadhar: req.body.aadhar,
              voter: req.body.voter,
              upi: req.body.upi,
              email: req.body.email,
              mobile: req.body.mobile,
              amount: req.body.amount,
              remarks: {
                remarkerName: operator.name,
                remarkerId: operator._id,
                remarkerRole: operator.role,
                remarkerRemarks: req.body.remarks,
              },
            });
            res.status(200).json({
              msg: "Loan User Created Successfully",
              type: "success",
              status: true,
            });
          }
          main().catch((error) => {
            res.status(500).json({
              msg: "Unable To Send Email",
              error,
              status: false,
            });
          });
        } catch (error) {
          res.status(500).json({ msg: "E-Mail Server Error", status: false });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ error, mgs: "Internal Server Error" });
  }
});
// get loan user All
router.post("/getLoanUsers", fetchAdmin, async (req, res) => {
  const userId = req.admin.id;
  try {
    const operator = await Admin.findById(userId).select("-password");
    if (!operator._id) {
      const getUser = await Customer.find();
      res.status(200).json({ msg: "No Data Found" });
      // if () {

      // }
    } else {
      const getUser = await Customer.find();
      res.status(200).json({ getUser });
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server Error", status: false, err: error });
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
router.post("/getCustomerLoans", fetchAdmin, async (req, res) => {
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

router.post("/loanStepI", fetchAdmin, async (req, res) => {
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

router.post("/loanStepII", fetchAdmin, async (req, res) => {
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

router.post("/loanStepIII", fetchAdmin, async (req, res) => {
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

router.post("/loanStepIV", fetchAdmin, async (req, res) => {
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
        const receivedData = {
          stepFour: true,
          annualSalary: req.body.annualSalary,
          otherAnnualIncome: req.body.otherAnnualIncome,
          bankName: req.body.bankName,
          bankBranch: req.body.bankBranch,
          bankIfsc: req.body.bankIfsc,
          bankAcNo: req.body.bankAcNo,
          bankAcType: req.body.bankAcType,
          bankCustomerId: req.body.bankCustomerId,
        };
        getLoanData = await Loan.findByIdAndUpdate(req.body.id, {
          $push: {
            remarks: {
              $each: [
                {
                  remarkerName: operator.name,
                  remarkerid: operator._id,
                  remarkerRole: operator.role,
                  remarkerRemarks: "Step 4 Has been Updated",
                },
              ],
            },
          },
          $set: {
            stepFour: true,
            annualSalary: req.body.annualSalary,
            otherAnnualIncome: req.body.otherAnnualIncome,
            bankName: req.body.bankName,
            bankBranch: req.body.bankBranch,
            bankIfsc: req.body.bankIfsc,
            bankAcNo: req.body.bankAcNo,
            bankAcType: req.body.bankAcType,
            bankCustomerId: req.body.bankCustomerId,
          },
        });

        res.status(200).json({
          msg: "Bank DetailsUpdated!",
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

router.post("/loanStepV", fetchAdmin, async (req, res) => {
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
            assetDetails: {
              $each: [
                {
                  assetType: req.body.assetType,
                  assetValue: req.body.assetValue,
                },
              ],
            },
            remarks: {
              $each: [
                {
                  remarkerName: operator.name,
                  remarkerid: operator._id,
                  remarkerRole: operator.role,
                  remarkerRemarks: "Step 5 Has been Updated",
                },
              ],
            },
          },
          $set: {
            stepFive: true,
          },
        });
        res.status(200).json({
          msg: "Asset Details Updated!",
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

router.post("/loanStepVI", fetchAdmin, async (req, res) => {
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
            existingLoanDetails: {
              $each: [
                {
                  loanType: req.body.loanType,
                  instName: req.body.instName,
                  since: req.body.since,
                  loanAmount: req.body.loanAmount,
                  tenureOfLoan: req.body.tenureOfLoan,
                  loanStatus: req.body.loanStatus,
                },
              ],
            },
            remarks: {
              $each: [
                {
                  remarkerName: operator.name,
                  remarkerid: operator._id,
                  remarkerRole: operator.role,
                  remarkerRemarks: "Step 6 Has been Updated",
                },
              ],
            },
          },
          $set: {
            stepSix: true,
          },
        });

        res.status(200).json({
          msg: "Existing Loan Details Updated!",
          login: true,
          status: true,
          isRedirect: true,
          getLoanData,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "Internal Server Error", status: false, err: error });
  }
});

router.post("/loanStepVII", fetchAdmin, async (req, res) => {
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
            collateralDetails: {
              $each: [
                {
                  collateralType: req.body.collateralType,
                  collateralName: req.body.collateralName,
                  collateralDetails: req.body.collateralDetails,
                  propertyOwnerOne: req.body.propertyOwnerOne,
                  propertyOwnerTwo: req.body.propertyOwnerTwo,
                  propertyAddress: req.body.propertyAddress,
                  propertyCurrentValue: req.body.propertyCurrentValue,
                },
              ],
            },
            remarks: {
              $each: [
                {
                  remarkerName: operator.name,
                  remarkerid: operator._id,
                  remarkerRole: operator.role,
                  remarkerRemarks: "Step 7 Collateral Details Has been Added",
                },
              ],
            },
          },
          $set: {
            stepSeven: true,
          },
        });

        res.status(200).json({
          msg: "Collateral Details Updated!",
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

router.post("/loanStepVIII", fetchAdmin, async (req, res) => {
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
            personalReferenceOne: {
              $each: [
                {
                  referenceName: req.body.referenceName,
                  collateralName: req.body.relationship,
                  referanceAddress: req.body.referanceAddress,
                  referanceCity: req.body.referanceCity,
                  referanceState: req.body.referanceState,
                  referancePIN: req.body.referancePIN,
                  referenceMobile: req.body.referenceMobile,
                },
              ],
            },
            remarks: {
              $each: [
                {
                  remarkerName: operator.name,
                  remarkerid: operator._id,
                  remarkerRole: operator.role,
                  remarkerRemarks: "Step 8 Has been Updated",
                },
              ],
            },
          },
          $set: {
            stepEight: true,
          },
        });

        res.status(200).json({
          msg: "Referance Details Added!",
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
router.post("/sendEmailTesting", fetchAdmin, async (req, res) => {
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
// testing data set
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
    const bodyReq = req.body;
    const emiData = req.body.data;

    // compute a base date = same day next month
    const today = new Date();
    const baseNextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1, // +1 -> next month
      today.getDate()
    );
    const emiPaymentArray = bodyReq.data.map((item, index) => {
      // dueDate for this EMI = baseNextMonth + index months
      const dueDate = new Date(
        baseNextMonth.getFullYear(),
        baseNextMonth.getMonth() + index,
        baseNextMonth.getDate()
      );

      return {
        emiNumber: `${index + 1}`,
        txnNumber: `TXN${Date.now()}_${index + 1}`, // safer unique-ish id
        month: item.m,
        opening: item.opening,
        emi: item.emi,
        principal: item.principal,
        interest: item.interest,
        // store GST as a number rounded to 2 decimals
        gstOnInterest: Math.round(item.interest * 0.18 * 100) / 100,
        closing: item.closing,
        dueDate,
        status: false,
      };
    });
    // extract totals start
    const totalPrincipal = emiData.reduce(
      (sum, item) => sum + item.principal,
      0
    );
    const totalInterest = emiData.reduce((sum, item) => sum + item.interest, 0);
    const netPayable = totalPrincipal + totalInterest;
    let saveCustomerEmi = await Emi.findOne({
      loanAccountNumber: req.body.loanAccountNumber,
    });
    if (saveCustomerEmi) {
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
            schedule: req.body.data, //schedule array
            emiPayment: emiPaymentArray, //emi payment array
          },
        }
      );
      res.status(200).json({ msg: "EMI Data Updated and Sent okk" });
    } else {
      saveCustomerEmi = await Emi.create({
        loanAccountNumber: req.body.loanAccountNumber,
        customerId: customerId,
        loanAmount: totalPrincipal,
        interest: req.body.interest,
        tenure: req.body.tenure,
        totalInterest: totalInterest,
        payableAmount: netPayable,
        type: req.body.type,
        schedule: req.body.data, //schedule array
        emiPayment: emiPaymentArray, //emi payment array
      });
      res.status(200).json({ msg: "EMI Data Updated and Sent ok" });
    }
  } catch (error) {
    console.log(error);
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
