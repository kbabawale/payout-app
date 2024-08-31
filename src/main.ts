import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/nestjs';
import { ConfigService } from '@nestjs/config';
import {
  NotAcceptableException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResponseInterceptor } from './util/http-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  /**
   * Configuration for Sentry used for logging errors and other possible issues
   */
  // Sentry.init({
  //   dsn: configService.get('SENTRY_URL'),
  //   // Tracing
  //   tracesSampleRate: 1.0, //  Capture 100% of the transactions

  //   // Set sampling rate for profiling - this is relative to tracesSampleRate
  //   profilesSampleRate: 1.0,
  // });

  /**
   * Custom headers on every endpoint
   */
  app.use(function (req, res, next) {
    res.header('x-powered-by', 'Technology');
    next();
  });

  /**
   * Enable CORS support for all endpoints to avoid browser cross host issues
   */
  app.enableCors({
    origin: '*',
    methods: 'GET, PUT, POST, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  /**
   * Configure factory function for handling validation errors globally
   */
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const result = validationErrors.map((error) => ({
          property: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));
        return new NotAcceptableException(
          // validationErrors[0].constraints,
          result[0].message,
          'Validation Error',
        );
      },
      stopAtFirstError: true,
    }),
  );

  /**
   * Swagger API documentation setup
   */
  const config = new DocumentBuilder()
    .setTitle('Vendy API Documentation')
    .setDescription('List of Endpoints')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  /**
   * Global configuration for handling endpoints response model
   */
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(configService.get('PORT'));
}
bootstrap();
