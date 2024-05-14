const mongoose = require("mongoose");

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
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Passwords do not match",
    },
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

const Marketer = mongoose.model("Marketer", marketerSchema);

module.exports = Marketer;
