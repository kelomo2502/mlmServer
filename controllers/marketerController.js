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

// Recursive function to update downlines
const updateDownlines = async (referrerId, newDownlineId) => {
  if (!referrerId) return;

  const referrer = await Marketer.findById(referrerId);
  if (referrer) {
    referrer.downlines.push(newDownlineId);
    await referrer.save();

    // Recursively update the downlines of the next referrer in the chain
    if (referrer.referredBy) {
      await updateDownlines(referrer.referredBy, newDownlineId);
    }
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

  checkPassword(password, confirmPassword);

  const newMarketer = new Marketer({
    name,
    phone,
    email,
    password,
  });

  await newMarketer.save();

  // Generate and assign the referral link
  const referralLink = generateReferralLink(newMarketer._id);
  newMarketer.referralLink = referralLink;
  await newMarketer.save();

  const token = generateToken(newMarketer._id);
  if (newMarketer) {
    const {
      _id,
      name,
      email,
      phone,
      role,
      balance,
      isVerified,
      bankDetail,
      photo,
      referralLink,
      downlines,
      commission,
    } = newMarketer;
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      secure: process.env.NODE_ENV === "development" ? false : true,
      sameSite: "none",
    });
    res.status(201).json({
      _id,
      name,
      email,
      phone,
      role,
      balance,
      isVerified,
      bankDetail,
      photo,
      referralLink,
      downlines,
      commission,
      token,
    });
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

  checkPassword(password, confirmPassword);

  const newMarketer = new Marketer({
    name,
    phone,
    email,
    password,
    referredBy: referralId, // Make sure to set the referredBy field
  });

  await newMarketer.save();

  // Generate and assign the referral link
  const referralLink = generateReferralLink(newMarketer._id);
  newMarketer.referralLink = referralLink;
  await newMarketer.save();

  // Update the downlines recursively
  await updateDownlines(referralId, newMarketer._id);

  const token = generateToken(newMarketer._id);
  if (newMarketer) {
    const {
      _id,
      name,
      email,
      phone,
      role,
      balance,
      isVerified,
      bankDetail,
      photo,
      referralLink,
      referredBy,
      downlines,
      commission,
    } = newMarketer;
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      secure: process.env.NODE_ENV === "development" ? false : true,
      sameSite: "none",
    });
    res.status(201).json({
      _id,
      name,
      email,
      phone,
      role,
      balance,
      isVerified,
      bankDetail,
      photo,
      referralLink,
      referredBy,
      downlines,
      commission,
      token,
    });
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Enter email and password");
  }
  const marketer = await Marketer.findOne({ email });
  if (!marketer) {
    res.status(400);
    throw new Error("Marketer does not exist");
  }
  const passwordIsCorrect = await bcrypt.compare(password, marketer.password);

  const token = generateToken(marketer._id);
  if (marketer && passwordIsCorrect) {
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      secure: process.env.NODE_ENV === "development" ? false : true,
      sameSite: "none",
    });
    const loggedInMarketer = await Marketer.findOne({ email }).select(
      "-password"
    );
    res.status(200).json({ loggedInMarketer, token });
  } else {
    throw new Error("Invalid Email or Password");
  }
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "You have logged out successfully" });
});

const getMarketer = asyncHandler(async (req, res) => {
  const marketer = await Marketer.findById(req.marketer._id).select(
    "-password"
  );
  if (marketer) {
    res.status(200).json(marketer);
  } else {
    throw new Error("Marketer not found");
  }
});

const getLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json(false);
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
      res.json(true);
    } else {
      res.json(false);
    }

    const marketer = await Marketer.findById(verified.id).select("-password");
    if (!marketer) {
      return res.json(false);
    }

    res.json(true);
  } catch (error) {
    res.json(false); // Token verification failed or some other error occurred
  }
});

const updateMarketer = asyncHandler(async (req, res) => {
  const marketer = await Marketer.findById(req.marketer._id);
  if (marketer) {
    const { phone, bankDetail } = marketer;
    marketer.phone = req.body.phone || phone;
    marketer.bankDetail = req.body.bankDetail || bankDetail;
    const updatedMarketer = await marketer.save();
    res.status(200).json(updatedMarketer);
  } else {
    res.status(400).json("Marketer details not found");
  }
});

const updatePhoto = asyncHandler(async (req, res) => {
  const { photo } = req.body;
  try {
    const marketer = await Marketer.findById(req.marketer._id);
    marketer.photo = photo;
    const updatedMarketer = await marketer.save();
    res.status(200).json(updatedMarketer);
  } catch (error) {
    res.status(400).json({ msg: "Marketer photo not found" });
  }
});

module.exports = {
  registerMarketer,
  registerUnderReferral,
  login,
  logout,
  getMarketer,
  getLoginStatus,
  updateMarketer,
  updatePhoto,
};
