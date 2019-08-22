class NotFoundRecordError extends Error {
  constructor(message) {
    super(message);
    this.status = 404;
  }
}

class NotAuthorizedError extends Error {
  constructor() {
    super();
    this.status = 403;
  }
}

module.exports = {
  NotFoundRecordError,
  NotAuthorizedError
};
