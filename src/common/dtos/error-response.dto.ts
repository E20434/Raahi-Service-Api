export class ValidationErrorDto {
  field_name: string;
  reason: string;
}

export class ErrorDetailsDto {
  error_code: string;
  message: string;
  request_id?: string;
}

export class ErrorResponseDto {
  status: 'error';
  error_details: ErrorDetailsDto;
  validation_errors?: ValidationErrorDto[];
}
