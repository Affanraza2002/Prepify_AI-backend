// routes/contactRoutes.js
const express = require('express');
const { sendContactEmail } = require('../controllers/contactController');

const contactRoutes = express.Router();

contactRoutes.post('/send', sendContactEmail);

module.exports = contactRoutes;
