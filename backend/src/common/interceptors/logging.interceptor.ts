import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        const staff = req.user?.sub ?? 'anon';
        const society = req.user?.societyId ?? '-';
        this.logger.log(req.method + ' ' + req.url + ' | staff=' + staff + ' | society=' + society + ' | ' + ms + 'ms');
      }),
    );
  }
}
