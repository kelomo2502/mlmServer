// routes/marketerRoutes.js
const express = require("express");
const router = express.Router();
const marketerController = require("../controllers/marketerController");

router.post("/register", marketerController.registerMarketer);
router.post("/register/:referralId", marketerController.registerUnderReferral);

module.exports = router;
