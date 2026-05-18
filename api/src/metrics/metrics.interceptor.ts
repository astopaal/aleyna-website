import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const end = this.metricsService.httpRequestDuration.startTimer();

    return next.handle().pipe(
      tap({
        next: () => this.record(request, response, end),
        error: () => this.record(request, response, end),
      }),
    );
  }

  private record(request: any, response: any, end: (labels?: any) => number) {
    const route = request.route?.path ?? request.url;
    const labels = {
      method: request.method,
      route,
      status_code: String(response.statusCode),
    };
    end(labels);
    if (response.statusCode >= 400) {
      this.metricsService.httpErrorTotal.inc(labels);
    }
  }
}
