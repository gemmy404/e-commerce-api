import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger} from '@nestjs/common';
import {Response} from 'express';
import {ApiResponseDto} from "../dto/api-response.dto";
import {HttpStatusText} from "../utils/httpStatusText";
import {ValidationException} from "../exceptions/validation.exception";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

    private readonly logger: Logger = new Logger(AllExceptionsFilter.name);

    async catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const apiResponse: ApiResponseDto<undefined | null> = {
            status: HttpStatusText.FAIL,
            data: undefined,
        };

        if (exception instanceof ValidationException) {
            const messages = exception.getResponse();

            if (typeof messages === 'object' && Array.isArray(messages)) {
                apiResponse.validationErrors = messages;

                return response.status(exception.getStatus()).json(apiResponse);
            }
        }

        if (exception instanceof HttpException) {
            apiResponse.status =
                exception.getStatus() < 500
                    ? HttpStatusText.FAIL
                    : HttpStatusText.ERROR;
            apiResponse.message = exception.message || 'Something went wrong. Please try again later';
            apiResponse.data = null;

            return response.status(exception.getStatus()).json(apiResponse);
        }

        apiResponse.status = HttpStatusText.ERROR;
        apiResponse.message = 'Internal server error';

        if (exception.name === 'MongoServerSelectionError') {
            this.logger.error('[DATABASE]', exception.message, exception.stack);
        }

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiResponse);
    }

}