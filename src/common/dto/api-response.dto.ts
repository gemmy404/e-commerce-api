import { HttpStatusText } from '../utils/httpStatusText';
import { ValidationError } from 'class-validator';

export interface ApiResponseDto<T> {
  status: HttpStatusText;
  data: T,
  message?: string;
  validationErrors?: ValidationError[];
}