import { Request, Response, NextFunction } from "express";

export const error = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  return res.status(error.statusCode).json({
    statusCode: error.statusCode,
    message: error.message,
  });
};

export class ApiError {
  message: string;
  statusCode: number;

  constructor(message: string, statusCode: number) {
    this.message = message;
    this.statusCode = statusCode;
  }
}
