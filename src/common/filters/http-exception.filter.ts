import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // If it's already our custom error format, just send it
    if (
      typeof exceptionResponse === 'object' &&
      'status' in exceptionResponse &&
      exceptionResponse['status'] === 'error'
    ) {
      return response.status(status).json(exceptionResponse);
    }

    // Otherwise, format it to our standard error response
    const requestId = `req_${Math.random().toString(36).substr(2, 9)}_alpha`;
    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? exceptionResponse['message']
        : exception.message;

    const errorResponse = {
      status: 'error',
      error_details: {
        error_code: this.getErrorCode(status),
        message: message || 'An error occurred',
        request_id: requestId,
      },
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.NOT_FOUND:
        return 'resource_not_found';
      case HttpStatus.BAD_REQUEST:
        return 'bad_request';
      case HttpStatus.UNAUTHORIZED:
        return 'unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'forbidden';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'validation_failed';
      default:
        return 'internal_server_error';
    }
  }
}
