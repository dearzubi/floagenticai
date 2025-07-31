import { AppError } from "./app.error.js";

export abstract class HttpError extends AppError {
  public readonly url?: string;
  public readonly method?: string;
  public readonly requestId?: string;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational = true,
    cause?: Error,
    context?: {
      url?: string;
      method?: string;
      requestId?: string;
    },
  ) {
    super(message, statusCode, errorCode, isOperational, cause);
    this.url = context?.url;
    this.method = context?.method;
    this.requestId = context?.requestId;
  }

  override toJSON(options?: { removeStack?: boolean }): ReturnType<
    AppError["toJSON"]
  > & {
    url?: string;
    method?: string;
    requestId?: string;
  } {
    const baseJson = super.toJSON(options);
    return {
      ...baseJson,
      ...(this.url && { url: this.url }),
      ...(this.method && { method: this.method }),
      ...(this.requestId && { requestId: this.requestId }),
    };
  }
}

export class NetworkError extends HttpError {
  constructor(
    message: string,
    errorCode = "NETWORK_ERROR",
    cause?: Error,
    context?: {
      url?: string;
      method?: string;
      requestId?: string;
    },
  ) {
    super(message, 0, errorCode, true, cause, context);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends HttpError {
  public readonly timeout: number;

  constructor(
    message: string,
    timeout: number,
    errorCode = "REQUEST_TIMEOUT",
    cause?: Error,
    context?: {
      url?: string;
      method?: string;
      requestId?: string;
    },
  ) {
    super(message, 408, errorCode, true, cause, context);
    this.name = "TimeoutError";
    this.timeout = timeout;
  }

  override toJSON(options?: { removeStack?: boolean }): ReturnType<
    HttpError["toJSON"]
  > & {
    timeout: number;
  } {
    const baseJson = super.toJSON(options);
    return {
      ...baseJson,
      timeout: this.timeout,
    };
  }
}

export class HttpResponseError extends HttpError {
  public readonly response?: {
    status: number;
    statusText: string;
    data?: unknown;
    headers?: Record<string, string>;
  };

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    response?: {
      status: number;
      statusText: string;
      data?: unknown;
      headers?: Record<string, string>;
    },
    cause?: Error,
    context?: {
      url?: string;
      method?: string;
      requestId?: string;
    },
  ) {
    super(message, statusCode, errorCode, statusCode < 500, cause, context);
    this.name = "HttpResponseError";
    this.response = response;
  }

  override toJSON(options?: { removeStack?: boolean }): ReturnType<
    HttpError["toJSON"]
  > & {
    response?: {
      status: number;
      statusText: string;
      data?: unknown;
      headers?: Record<string, string>;
    };
  } {
    const baseJson = super.toJSON(options);
    return {
      ...baseJson,
      ...(this.response && { response: this.response }),
    };
  }
}

export class RetryExhaustedError extends HttpError {
  public readonly attempts: number;
  public readonly lastError: Error;

  constructor(
    message: string,
    attempts: number,
    lastError: Error,
    errorCode = "RETRY_EXHAUSTED",
    context?: {
      url?: string;
      method?: string;
      requestId?: string;
    },
  ) {
    super(message, 503, errorCode, true, lastError, context);
    this.name = "RetryExhaustedError";
    this.attempts = attempts;
    this.lastError = lastError;
  }

  override toJSON(options?: { removeStack?: boolean }): ReturnType<
    HttpError["toJSON"]
  > & {
    attempts: number;
    lastError: {
      name: string;
      message: string;
      stack?: string;
    };
  } {
    const baseJson = super.toJSON(options);
    return {
      ...baseJson,
      attempts: this.attempts,
      lastError: {
        name: this.lastError.name,
        message: this.lastError.message,
        ...(this.lastError.stack &&
          !options?.removeStack && { stack: this.lastError.stack }),
      },
    };
  }
}

export class ResponseValidationError extends HttpError {
  public readonly validationErrors: unknown[];

  constructor(
    message: string,
    validationErrors: unknown[],
    errorCode = "RESPONSE_VALIDATION_ERROR",
    context?: {
      url?: string;
      method?: string;
      requestId?: string;
    },
  ) {
    super(message, 422, errorCode, true, undefined, context);
    this.name = "ResponseValidationError";
    this.validationErrors = validationErrors;
  }

  override toJSON(options?: { removeStack?: boolean }): ReturnType<
    HttpError["toJSON"]
  > & {
    validationErrors: unknown[];
  } {
    const baseJson = super.toJSON(options);
    return {
      ...baseJson,
      validationErrors: this.validationErrors,
    };
  }
}

export class CacheError extends HttpError {
  constructor(
    message: string,
    errorCode = "CACHE_ERROR",
    cause?: Error,
    context?: {
      url?: string;
      method?: string;
      requestId?: string;
    },
  ) {
    super(message, 500, errorCode, true, cause, context);
    this.name = "CacheError";
  }
}
