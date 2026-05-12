import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorDetails {
  error_code: string;
  message: string;
  validation_errors?: Array<{ field_name: string; reason: string }>;
}

export class CustomHttpException extends HttpException {
  constructor(details: ErrorDetails, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    const requestId = `req_${Math.random().toString(36).substr(2, 9)}_alpha`;
    const response = {
      status: 'error',
      error_details: {
        error_code: details.error_code,
        message: details.message,
        request_id: requestId,
      },
      ...(details.validation_errors && { validation_errors: details.validation_errors }),
    };
    super(response, statusCode);
  }
}

export class ResourceNotFoundException extends CustomHttpException {
  constructor(message: string) {
    super(
      {
        error_code: 'resource_not_found',
        message: message || 'No record found with the identifier provided in the URI.',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ValidationFailedException extends CustomHttpException {
  constructor(
    message: string,
    validationErrors: Array<{ field_name: string; reason: string }>,
  ) {
    super(
      {
        error_code: 'validation_failed',
        message,
        validation_errors: validationErrors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class BadRequestException extends CustomHttpException {
  constructor(message: string) {
    super(
      {
        error_code: 'bad_request',
        message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
