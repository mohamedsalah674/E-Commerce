const CustomError=require('./custom-error')


module.exports = class NotAuthorizedError extends CustomError {
  statusCode = 401
  constructor() {
    super("Not authorized!")

    //Only because we are extending a built in class
    Object.setPrototypeOf(this, NotAuthorizedError.prototype)
  }
  serializeErrors() {
    return [{ message: "Not authorized!" }]
  }
}

// throw new RequestValidaionError(errors);

