// routes/marketerRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerMarketer,
  registerUnderReferral,
  login,
  logout,
  getMarketer,
  getLoginStatus,
  updateMarketer,
} = require("../controllers/marketerController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/register", registerMarketer);
router.post("/register/:referralId", registerUnderReferral);
router.post("/login", login);
router.delete("/logout", logout);
router.get("/getMarketer", protect, getMarketer);
router.get("/getStatus", getLoginStatus);
router.patch("/updateMarketer", protect, updateMarketer);

module.exports = router;
