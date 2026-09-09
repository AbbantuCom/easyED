import { NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';

export class AppError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class RateLimitedError extends AppError {
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number, message = 'Too many requests') {
    super(message, 429);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class ValidationError extends AppError {
  fieldErrors: Record<string, string>;

  constructor(fieldErrors: Record<string, string>) {
    super('Validation failed', 400);
    this.fieldErrors = fieldErrors;
  }
}

function zodErrorToFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_root';
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

type RouteHandler<Ctx> = (request: Request, context: Ctx) => Promise<NextResponse>;

export function withErrorHandler<Ctx = unknown>(handler: RouteHandler<Ctx>): RouteHandler<Ctx> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json({ errors: error.fieldErrors }, { status: error.status });
      }
      if (error instanceof RateLimitedError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status, headers: { 'Retry-After': String(error.retryAfterSeconds) } },
        );
      }
      if (error instanceof AppError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      if (error instanceof ZodError) {
        return NextResponse.json({ errors: zodErrorToFieldErrors(error) }, { status: 400 });
      }
      console.error('Unhandled error in route handler:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export function parseWithZod<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(zodErrorToFieldErrors(result.error));
  }
  return result.data;
}
