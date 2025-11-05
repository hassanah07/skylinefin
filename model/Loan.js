const mongoose = require("mongoose");
const { Schema } = mongoose;

const LoanSchema = new Schema(
  {
    loanAccountNumber: {
      type: Number,
      required: true,
    },
    customerId: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    loanType: {
      type: String,
      required: true,
    },
    repaymentPeriod: {
      type: String,
      required: true,
    },
    interestType: {
      type: String,
      required: true,
    },
    interestPercentage: {
      type: String,
      required: true,
    },
    stepOne: {
      type: Boolean,
      default: false,
    },
    // step two
    // present address fields

    presAddress: {
      type: String,
    },
    presLandmark: {
      type: String,
    },
    presCity: {
      type: String,
    },
    presState: {
      type: String,
    },
    presPIN: {
      type: String,
    },
    altMobile: {
      type: String,
    },
    presParmAddressSame: {
      type: Boolean,
    },
    // permanent address fields
    permAddress: {
      type: String,
    },
    permLandmark: {
      type: String,
    },
    permCity: {
      type: String,
    },
    permState: {
      type: String,
    },
    permPIN: {
      type: String,
    },
    stepTwo: {
      type: Boolean,
      default: false,
    },
    isCompany: {
      type: Boolean,
    },
    // company details
    companyName: {
      type: String,
    },
    // company address
    companyAddress: {
      type: String,
    },
    companyState: {
      type: String,
    },
    companyCity: {
      type: String,
    },
    companyPIN: {
      type: String,
    },
    // company address
    // company details
    yearofIncorporation: {
      type: String,
    },
    cinNo: {
      type: String,
    },
    companyPanNo: {
      type: String,
    },
    companyGst: {
      type: String,
    },
    companyEffDate: {
      type: String,
    },
    officePhone: {
      type: String,
    },
    officeEmail: {
      type: String,
    },
    stepThree: {
      type: Boolean,
      default: false,
    },
    // director/ partner details
    companyPartnerDetails: [
      {
        partnerName: {
          type: String,
        },
        partnerPan: {
          type: String,
        },
        profitShare: {
          type: String,
        },
        partnerDob: {
          type: Date,
        },
        partnerMobile: {
          type: Number,
        },
        partnerEmail: {
          type: String,
        },
        dinNo: {
          type: String,
        },
      },
    ],
    stepFour: {
      type: Boolean,
      default: false,
    },
    //income details
    annualSalary: {
      type: Number,
    },
    otherAnnualIncome: {
      type: Number,
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
    stepFive: {
      type: Boolean,
      default: false,
    },
    // asset owns
    assetDetails: [
      {
        assetType: {
          type: String,
        },
        assetValue: {
          type: Number,
        },
      },
    ],
    stepSix: {
      type: Boolean,
      default: false,
    },
    // Existing Loan Details
    existingLoanDetails: [
      {
        loanType: {
          type: String,
        },
        instName: {
          type: String,
        },
        since: {
          type: Date,
        },
        loanAmount: {
          type: Number,
        },
        tenureOfLoan: {
          type: Number,
        },
        loanStatus: {
          type: String,
        },
      },
    ],
    stepSeven: {
      type: Boolean,
      default: false,
    },
    // collateral Details
    collateralDetails: [
      {
        collateralType: {
          type: String,
        },
        collateralName: {
          type: String,
        },
        collateralDetails: {
          type: String,
        },
        propertyOwnerOne: {
          type: String,
        },
        propertyOwnerTwo: {
          type: String,
        },
        propertyAddress: {
          type: String,
        },
        propertyCurrentValue: {
          type: Number,
        },
      },
    ],
    stepEight: {
      type: Boolean,
      default: false,
    },
    // personal references
    personalReferenceOne: [
      {
        referenceName: {
          type: String,
        },
        relationship: {
          type: String,
        },
        referanceAddress: {
          type: String,
        },
        referanceCity: {
          type: String,
        },
        referanceState: {
          type: String,
        },
        referancePIN: {
          type: Number,
        },
        referenceMobile: {
          type: Number,
        },
      },
    ],
    finalizedByUser: {
      type: String,
    },
    finalizedByAdmin: {
      type: String,
    },
    revertedTo: {
      type: String,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isPaymentProcessed: {
      type: Boolean,
      default: false,
    },
    processedAt: {
      type: String,
    },
    processedDate: {
      type: Date,
    },
    status: {
      type: Boolean,
      default: false,
    },
    isFinished: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: Number,
    },
    otpExpiry: {
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
        remarkerRemarks: {
          type: String,
        },
      },
      { timestamps: true },
    ],
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", LoanSchema);
module.exports = Loan;
