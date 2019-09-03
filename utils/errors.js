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

class MissingFieldError extends Error {
  constructor() {
    super();
    this.status = 422;
  }
}

class LoginFailedError extends Error {
  constructor(message) {
    super(message);
    this.status = 401;
  }
}

class DuplicateFoundError extends Error {
  constructor(message) {
    super(message);
    this.status = 409;
  }
}

class RedisConfigMissingError extends Error {
  constructor() {
    super("Отсутствуют параметры для Redis. Добавтьте REDIS_HOST, REDIS_PORT в переменные окружения");
  }
}


module.exports = {
  NotFoundRecordError,
  NotAuthorizedError,
  MissingFieldError,
  LoginFailedError,
  RedisConfigMissingError
};
