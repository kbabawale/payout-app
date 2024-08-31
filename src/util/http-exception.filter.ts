import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ERR = { message: string; error: string; statusCode: number };
@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  constructor(
    @Inject(ConfigService)
    public config: ConfigService,
  ) {}

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    // const m = exception.getResponse() as ERR;

    const logResponse = {
      message:
        exception instanceof HttpException ? exception.message : exception,
      meta: {
        method: request.method,
        code: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    response.status(status).json(logResponse);
  }
}
