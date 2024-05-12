const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Marketer = require("../models/marketer");
const generateReferralLink = require("../utils/generateReferralLink");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const registerMarketer = asyncHandler(async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !email || !password) {
    res.status(400);
    throw new Error("Fill all required fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password cannot be less than 6 characters");
  }
  const emailExists = await Marketer.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Email already exists");
  }
  const phoneExists = await Marketer.findOne({ phone });
  if (phoneExists) {
    res.status(400);
    throw new Error("The phone number already exists");
  }
  const referralLink = generateReferralLink();
  const newMarketer = await Marketer.create({
    name,
    phone,
    email,
    password,
    confirmPassword: password,
    referralLink,
  });
  res.status(201).json(newMarketer);
});

const registerUnderReferral = asyncHandler(async (req, res) => {
  const { referralId } = req.params;
  const { name, phone, email, password } = req.body;
  const referredBy = await Marketer.findById(referralId);
  if (!referredBy) {
    res.status(404);
    throw new Error("Referral not found");
  }
  const referralLink = generateReferralLink(referralId);
  const newMarketer = await Marketer.create({
    name,
    phone,
    email,
    password,
    confirmPassword: password,
    referralLink,
    referredBy,
  });
  const allDownlines = [...referredBy.downlines, newMarketer._id];
  referredBy.downlines = allDownlines;
  await referredBy.save();
  res.status(201).json(newMarketer);
});

module.exports = {
  registerMarketer,
  registerUnderReferral,
};
