// routes/marketerRoutes.js
const express = require("express");
const router = express.Router();
const {registerMarketer,registerUnderReferral,login, logout} = require("../controllers/marketerController");

router.post("/register", registerMarketer);
router.post("/register/:referralId", registerUnderReferral);
router.post("/login",login)
router.delete("/logout",logout)

module.exports = router;
