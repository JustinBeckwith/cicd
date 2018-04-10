const logger = require('./logger');
const util = require('util');

module.exports = {
  dig: err => {
    if (err.name === 'PartialFailureError') {
      for (let e of err.errors) {
        logger.error(`Failed to analyze image`);
        for (let e2 of e.errors) {
          logger.error(e2);
        }
      }
    }
  }
}