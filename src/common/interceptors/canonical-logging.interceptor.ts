import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { CanonicalLogService } from '../services/canonical-log.service';

@Injectable()
export class CanonicalLoggingInterceptor implements NestInterceptor {
  constructor(private readonly canonicalLogService: CanonicalLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const requestId = req.headers['x-request-id'] || uuidv4();
    const method = req.method;
    // Build full URL where possible
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['host'] || req.hostname || '';
  const url = req.originalUrl || req.url || '';
  const fullUrl = host ? `${proto}://${host}${url}` : url;

    return next.handle().pipe(
      tap({
        next: () => {},
        error: () => {
          const duration = (Date.now() - now) / 1000;
          const logData = {
            timestamp: new Date().toISOString(),
            requestId,
            duration,
            httpMethod: method,
            httpPath: url, // relative path
            fullUrl, // full URL including host
            httpStatus: res.statusCode || 500,
            remoteIp: req.ip || req.socket?.remoteAddress,
            userAgent: req.headers['user-agent'],
          };
          this.canonicalLogService.logRequest(logData as any);
        },
        complete: () => {
          const duration = (Date.now() - now) / 1000;
          const logData = {
            timestamp: new Date().toISOString(),
            requestId,
            duration,
            httpMethod: method,
            httpPath: url, // relative path
            fullUrl, // full URL including host
            httpStatus: res.statusCode || 200,
            remoteIp: req.ip || req.socket?.remoteAddress,
            userAgent: req.headers['user-agent'],
          };
          this.canonicalLogService.logRequest(logData as any);
        }
      })
    );
  }
}
