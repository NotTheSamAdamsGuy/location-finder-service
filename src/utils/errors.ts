export class NotFoundError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

export class BadRequestError extends Error {
  statusCode: number;
  errors: unknown;
  constructor(message: string, errors?: unknown) {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;
    this.errors = errors;
  }
}

export class UnauthorizedError extends Error {
  statusCode: number;

  constructor() {
    super("Invalid credentials were provided");
    this.name = "UnauthorizedError";
    this.statusCode = 401;
  }
}

export class ForbiddenError extends Error {
  statusCode: number;

  constructor() {
    super("User does not have permission to access this route");
    this.name = "UnauthorizedError";
    this.statusCode = 403;
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class InternalServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
  }
}
