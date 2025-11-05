const mongoose = require("mongoose");
const { Schema } = mongoose;

const LoanSchema = new Schema(
  {
    customerId: {
      type: String,
      required: true,
    },
    occuType: {
      type: String,
      required: true,
    },
    occuType: {
      type: String,
      required: true,
    },

    empType: {
      type: String,
    },
    orgType: {
      type: String,
    },
    BussType: {
      type: String,
    },
    commuType: {
      type: String,
    },
    gstNo: {
      type: String,
    },
    fullName: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
      required: true,
    },
    motherName: {
      type: String,
      required: true,
    },
    spouseName: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
      required: true,
    },
    dependentNo: {
      type: Number,
      required: true,
    },
    religion: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    passport: {
      type: String,
    },
    passportExp: {
      type: String,
    },
    driving: {
      type: String,
    },
    drivingExp: {
      type: String,
    },
    pan: {
      type: String,
      required: true,
    },
    aadhar: {
      type: String,
      required: true,
    },
    voter: {
      type: String,
      required: true,
    },
    upi: {
      type: String,
    },
    email: {
      type: String,
    },
    mobile: {
      type: String,
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
      },
      { timestamps: true },
    ],
    addressType: {
      type: String,
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
    processedBy: {
      type: String,
    },
    status: {
      type: Boolean,
      default: false,
    },
    processedAt: {
      type: String,
    },
    processedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", LoanSchema);
module.exports = Loan;
