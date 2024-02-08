const CustomError=require('./custom-error')

module.exports =class InternalServerError extends CustomError {
  reason = "Server Error"
  statusCode = 500
  constructor() {
    super("Server Error")

    Object.setPrototypeOf(this, InternalServerError.prototype)
  }

  serializeErrors() {
    return [{ message: this.reason }]
  }
}
