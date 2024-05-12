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
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: [true, "Email already exists"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
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
});

const Marketer = mongoose.model("Marketer", marketerSchema);

module.exports = Marketer;
