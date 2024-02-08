
module.exports = class DatabaseConnectionError extends CustomError {
  reason = "Error connecting to database"
  statusCode = 500
  constructor() {
    super("Error connecting to DB")

    //Only because we are extending a built in class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype)
  }

  serializeErrors() {
    return [{ message: this.reason }]
  }
}
