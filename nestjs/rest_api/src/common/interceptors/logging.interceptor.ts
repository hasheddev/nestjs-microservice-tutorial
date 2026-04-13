import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

//Middleware runs before interceptors which runs after guards but before pipes
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const userAgent = request.get('user-agent') || 'unknown';
    const userId = (request.user as { id?: string })?.id || 'unauthenticated';
    this.logger.log(
      `Request method =  [${method}] - Path = [${url}] - User [${userId}] - UserAgent [${userAgent}]`,
    );

    const startTime = Date.now();

    const getDuration = () => Date.now() - startTime;

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = getDuration();

          this.logger.log(
            `[${method}] [${url}] - [${duration}ms] - Response length [${JSON.stringify(data).length || 0} bytes]`,
          );
        },
        error: (error: { message?: string }) => {
          const duration = getDuration();
          this.logger.log(
            `[${method}] [${url}] - [${duration}ms] Error ${error?.message || 'An error occured'}`,
          );
        },
      }),
    );
  }
}
