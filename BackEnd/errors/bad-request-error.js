const CustomError = require('./custom-error');
module.exports = class BadRequestError extends CustomError {
  statusCode = 400;
  

  constructor(message) {
    super(message);

    this.message = message;

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
};
