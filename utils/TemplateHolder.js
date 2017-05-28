'use strict';

const _ = require('lodash');


class TemplateHolder {
    constructor() {
        this.templates = [];
    }

    add(template) {
        this.templates.push(template);
    }

    get(templateName) {
        return _.find(this.templates, { 'name': templateName });
    }

    isStored(templateName) {
        return (_.find(this.templates, { 'name': templateName }) !== undefined);
    }
}

module.exports = new TemplateHolder();