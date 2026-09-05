export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (message: string) => new AppError(400, message);
export const unauthorized = (message = 'Not authenticated') => new AppError(401, message);
export const forbidden = (message = 'Not allowed') => new AppError(403, message);
export const notFound = (message = 'Not found') => new AppError(404, message);
export const conflict = (message: string) => new AppError(409, message);
