'use strict';

const log = require('../libs/log');

module.exports = function*(next) {

  try {
    yield * next;
  } catch (e) {

    this.set('X-Content-Type-Options', 'nosniff');

    let preferredType = this.accepts('html', 'json');

    if (e.status) {
      this.status = e.status;

      // could use template methods to render error page
      if (preferredType == 'json') {
        this.body = {
          error: e.message
        };
      } else {
        this.body = e.message;
      }

    } else if (e.name == 'ValidationError') {

      this.status = 400;

      var errors = {};

      for (var field in e.errors) {
        errors[field] = e.errors[field].message;
      }

      log.debug("ValidationError", {errors:errors});

      if (preferredType == 'json') {
        this.body = {
          errors: errors
        };
      } else {
        this.body = "Bad request";
      }

    } else {
      this.body = "Error 500";
      this.status = 500;
      log.error(e.message, e.stack);
    }

  }
};