export type HTTPError = Error & {
  statusCode: HTTPErrorStatusCode;
};

export type HTTPErrorStatusCode = 400 | 500 | 404;
