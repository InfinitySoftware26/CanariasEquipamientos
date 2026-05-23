import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse();
    const request  = ctx.getRequest();

    const statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? (exception.getResponse() as any)?.message ?? exception.message
      : 'Error interno del servidor';

    if (statusCode >= 500) {
      this.logger.error(
        request.method + ' ' + request.url + ' -> ' + statusCode,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(request.method + ' ' + request.url + ' -> ' + statusCode + ': ' + String(message));
    }

    response.status(statusCode).json({
      statusCode, message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
