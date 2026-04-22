const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");

const controller = require("./auth.controller");

router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/logout", auth, controller.logout);

module.exports = router;
