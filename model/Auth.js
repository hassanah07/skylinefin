const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: Number,
      required: true,
      unique: true,
      // max: [10, "set a 10 digit mobile number"],
    },
    password: {
      type: String,
      required: true,
      min: [6, "set a long password"],
    },
    otp: {
      type: Number,
      // required: true,
      // unique: true,
    },
    image: {
      type: String,
      default:
        "https://greenacresportsmed.com.au/wp-content/uploads/2018/01/dummy-image.jpg",
    },
    desc: {
      type: String,
    },
    role: {
      type: String,
      default: "Author",
    },
    level: {
      type: String,
      default: "Bronze",
    },
    status: {
      type: Boolean,
      default: 0,
    },
    deleted: {
      type: Boolean,
      default: 0,
    },
    monetized: {
      type: Boolean,
      default: 0,
    },
    withdrawn: {
      type: Boolean,
      default: 0,
    },
    login: {
      type: Boolean,
      default: false,
    },
    profileId: {
      type: String,
      default: 111,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
