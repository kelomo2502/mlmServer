const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Marketer = require("../models/marketer");

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: "Not authorized, please login" });
    return;
  }

  try {
    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Get marketer_id from token
    const marketer = await Marketer.findById(verified.id).select("-password");
    if (!marketer) {
      res.status(401).json({ message: "Marketer not found" });
      return;
    }

    req.marketer = marketer;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, please login!" });
  }
});

module.exports = {
  protect,
};
