const express = require('express');
const router = express.Router();

const controller = require('./auth.controller');

console.log('CONTROLLER:', controller); // 👈 déjalo solo temporal

router.post('/login', controller.login);

module.exports = router;