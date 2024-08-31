import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { Response as ExpressResponse } from 'express';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ResponseObj: ExpressResponse = context.switchToHttp().getResponse();
    ResponseObj.setHeader('API-Author', 'Kolapo Babawale');
    return next.handle();
  }
}
