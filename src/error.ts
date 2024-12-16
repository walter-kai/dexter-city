export type HTTPError = Error & {
  statusCode: HTTPErrorStatusCode;
};

export type HTTPErrorStatusCode = 400 | 500 | 404;

// Custom Error Classes
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}