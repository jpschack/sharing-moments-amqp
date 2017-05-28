'use strict';

const nodemailer = require('nodemailer');
const config     = require('../config');

const mailer = nodemailer.createTransport({
    service: config.mail.auth.service,
    auth: {
        user: config.mail.auth.user,
        pass: config.mail.auth.password
    }
});

module.exports = mailer;