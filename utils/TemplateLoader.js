'use strict';

const handlebars     = require('handlebars');
const fs             = require('fs');
const config         = require('../config');
const logger         = require('./logger');
const Template       = require('./Template');
const TemplateHolder = require('./TemplateHolder');


function renderToString(source, data, callback) {
    const template = handlebars.compile(source);
    const outputString = template(data);
    callback(outputString);
}

class TemplateLoader {
    constructor() {}

    static loadTemplate(filename, data, callback) {
        if (TemplateHolder.isStored(filename)) {
            const template = TemplateHolder.get(filename);
            const source = template.html;

            renderToString(source, data, (html) => {
                callback(null, html);
            });
        } else {
            const filepath = config.templatePath + '/' + filename + '.hbs';

            fs.readFile(filepath, (error, fileContent) => {
                if (!error) {
                    const source = fileContent.toString();
                    TemplateHolder.add(new Template(filename, source));

                    renderToString(source, data, (html) => {
                        callback(null, html);
                    });
                } else {
                    callback(error, null);
                }
            });
        }
    }
}

module.exports = TemplateLoader;