import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

/** SQLSTATE de PostgreSQL para violación de restricción única. */
const PG_UNIQUE_VIOLATION = '23505';

export const UNIQUE_VIOLATION_MESSAGE =
  'La operación entra en conflicto con un registro existente';

function isUniqueViolation(exception: unknown): exception is QueryFailedError {
  if (!(exception instanceof QueryFailedError)) return false;
  const driverError = (exception as QueryFailedError & { driverError?: { code?: string } }).driverError;
  return driverError?.code === PG_UNIQUE_VIOLATION;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse();
    const request  = ctx.getRequest();

    // Violación de unicidad (p. ej. dos cajas abiertas o dos cierres del día
    // por concurrencia) → 409 con mensaje genérico. El nombre del constraint
    // solo se registra en el log del servidor, nunca en la respuesta.
    if (isUniqueViolation(exception)) {
      const constraint = (exception.driverError as { constraint?: string }).constraint ?? 'desconocido';
      this.logger.warn(
        request.method + ' ' + request.url + ' -> 409: unique violation (' + constraint + ')',
      );
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: UNIQUE_VIOLATION_MESSAGE,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

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
