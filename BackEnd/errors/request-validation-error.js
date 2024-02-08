const CustomError=require('./custom-error')

module.exports = class RequestValidationError extends CustomError {
  statusCode = 400

  constructor(errors) {
    super("Invalid request parameters")

    this.errors = errors

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype)
  }

  serializeErrors() {
    return this.errors.map(err => {
      return { message: err.msg, field: err.param }
    })
  }
}
