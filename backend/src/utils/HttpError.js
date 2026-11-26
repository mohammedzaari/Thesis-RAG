/** Error carrying an HTTP status code, rendered by the global error handler. */
export class HttpError extends Error {
  /**
   * @param {number} status HTTP status code
   * @param {string} message Human readable message
   * @param {unknown} [details] Optional machine readable details
   */
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}
