export class CustomError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.status = status || 500; // Default to a 500 Internal Server Error status code
    Error.captureStackTrace(this, this.constructor);
  }
}

// module.exports = CustomError;
