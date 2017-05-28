'use strict';

const config          = require('./config');
const amqplib         = require('amqplib/callback_api');
const logger          = require("./utils/logger");
const transport       = require("./utils/mailer");
const TemplateLoader  = require("./utils/TemplateLoader");


amqplib.connect(config.amqp, (err, connection) => {
    if (err) {
        logger.error(err.stack);
        return process.exit(1);
    }
    logger.info('[AMQP] connected');

    connection.createChannel((err, channel) => {
        if (err) {
            logger.error(err.stack);
            return process.exit(1);
        }
        logger.info('[AMQP] channel opened');

        channel.assertQueue(config.queue, {
            // Ensure that the queue is not deleted when server restarts
            durable: true
        }, err => {
            if (err) {
                logger.error(err.stack);
                return process.exit(1);
            }
            logger.info('[AMQP] waiting for messages on queue ' + config.queue);

            channel.prefetch(1);

            channel.consume(config.queue, data => {
                if (data === null) {
                    return;
                }

                const message = JSON.parse(data.content.toString());

                if (message && message.type == 'email' && message.to && message.subject && message.file && message.content) {
                    TemplateLoader.loadTemplate(message.file, message.content, function(error, html) {
                        if (error) {
                            logger.error(error);
                            return channel.nack(data);
                        } else {
                            const mailData = {
                                from: config.mail.from,
                                to: message.to,
                                subject: message.subject,
                                html: html
                            }

                            transport.sendMail(mailData, (err, info) => {
                                if (err) {
                                    logger.error(err.stack);
                                    return channel.nack(data);
                                }

                                logger.info('[AMQP] Delivered message %s', info.messageId);
                                channel.ack(data);
                            });
                        }
                    });
                } else {
                    logger.error('[AMQP] Unsupported message or missing data: ' + message);
                    channel.ack(data);
                }
            });
        });
    });
});