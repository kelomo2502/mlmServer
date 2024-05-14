const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const marketerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  phone: {
    type: String,
    required: [true, "Please enter your phone number"],
    unique: [true, "Phone number already exists"],
  },
  role: {
    type: String,
    required: [true],
    default: "marketer",
    enum: ["marketer", "admin"],
  },
  balance: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: [true, "Email already exists"],
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please enter a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password must be minimum of 6 characters"],
  },
  referralLink: {
    type: String,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Marketer",
  },
  downlines: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Marketer",
    },
  ],
  commissions: [
    {
      amount: {
        type: Number,
        required: true,
      },
      product: {
        type: String,
        required: true,
      },
      paid: {
        type: Boolean,
        default: false,
      },
    },
  ],
});
// Encrypt password before saving it to DB
marketerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const Marketer = mongoose.model("Marketer", marketerSchema);

module.exports = Marketer;
