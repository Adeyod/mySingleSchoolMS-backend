export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: 400 | 401 | 402 | 403 | 404 | 408 | 409 | 410 | 415 | 429
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    this.name = 'AppError';
  }
}

export class JoiError extends Error {
  public statusCode: number;
  public type?: string;
  constructor(message: string, statusCode: number = 400, type?: string) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    Object.setPrototypeOf(this, JoiError.prototype);
    this.name = 'JoiError';
  }
}

export class JwtError extends Error {
  public statusCode: number;
  public expiredAt?: Date;
  constructor(public message: string, statusCode: number, expiredAt?: Date) {
    super(message);
    this.statusCode = statusCode;
    this.expiredAt = expiredAt;
    console.log('jwt expired:', expiredAt);
    Object.setPrototypeOf(this, JwtError.prototype);
    this.name = 'JwtError';
  }
}
