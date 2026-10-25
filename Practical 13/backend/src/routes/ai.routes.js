const express = require("express");
const { generateDescription } = require("../controller/ai.controller");

const router = express.Router();

router.post("/generate-description", generateDescription);

module.exports = router;
