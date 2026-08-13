const express = require("express");

const router = express.Router();

const { googleLogin, sastranetLogin } = require("../controllers/userAuthController");

router.post("/google", googleLogin);
router.post("/sastranet", sastranetLogin);

module.exports = router;
