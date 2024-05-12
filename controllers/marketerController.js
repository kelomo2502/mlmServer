const asyncHandler = require("express-async-handler");
// controllers/marketerController.js
const Marketer = require("../models/marketer");
const generateReferralLink = require("../utils/generateReferralLink");

const registerMarketer = asyncHandler(async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !email || !password) {
    res.status(400);
    throw new Error("Fill all required fields");
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
