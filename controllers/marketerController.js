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

const checkPassword = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    throw new Error("Password does not match");
  }
};

const registerMarketer = asyncHandler(async (req, res) => {
  const { name, phone, email, password, confirmPassword } = req.body;
  if (!name || !phone || !email || !password || !confirmPassword) {
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
  const newMarketer = new Marketer({
    name,
    phone,
    email,
    password,
    confirmPassword,
    referralLink,
  });
  checkPassword(password, confirmPassword);
  await newMarketer.save();

  const token = generateToken(newMarketer._id);
  if (newMarketer) {
    const { _id, name, email, phone } = newMarketer;
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      secure: process.env.NODE_ENV === "development" ? false : true,
      sameSite: "none",
    });
    res.status(201).json({ _id, name, email, phone, token });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const registerUnderReferral = asyncHandler(async (req, res) => {
  const { referralId } = req.params;
  const { name, phone, email, password, confirmPassword } = req.body;
  const referredBy = await Marketer.findById(referralId);
  if (!referredBy) {
    res.status(404);
    throw new Error("Referral not found");
  }
  const referralLink = generateReferralLink(referralId);
  const newMarketer = new Marketer({
    name,
    phone,
    email,
    password,
    confirmPassword,
    referralLink,
    referredBy,
  });
  checkPassword(password, confirmPassword);
  await newMarketer.save();

  // Add the new marketer as a direct downline
  referredBy.downlines.push(newMarketer._id);
  await referredBy.save();
  // If the referrer has its own referrer, recursively add downlines
    if (referredBy.referredBy) {
      const parentReferrer = await Marketer.findById(referredBy.referredBy);
      if (parentReferrer) {
        // Add the new marketer as a downline for the parent referrer
        parentReferrer.downlines.push(newMarketer._id);
        await parentReferrer.save();
      }
    }

  const token = generateToken(newMarketer._id);
  if (newMarketer) {
    const { name, phone, email, referralLink, referredBy } = newMarketer;
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      secure: process.env.NODE_ENV === "development" ? false : true,
      sameSite: "none",
    });
    res
      .status(201)
      .json({ name, phone, email, referralLink, referredBy, token });
  }
});

module.exports = {
  registerMarketer,
  registerUnderReferral,
};


