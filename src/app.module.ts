import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransferModule } from './transfer/transfer.module';
import { APP_FILTER, APP_GUARD, RouterModule } from '@nestjs/core';
import { routes } from './routes';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import * as Joi from 'joi';
import { AllExceptionsFilter } from './util/http-exception.filter';
import { DatabaseModule } from './util/database/database.module';
import { JWTStrategy } from './util/jwt/jwt.strategy';

@Module({
  imports: [
    HttpModule,
    TransferModule,
    PassportModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    DatabaseModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 30,
      },
    ]),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_USERNAME: Joi.string().required(),
        POSTGRES_DATABASE: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_DIALECT: Joi.string().required(),
        PORT: Joi.number().required(),
        SENTRY_URL: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    RouterModule.register(routes),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JWTStrategy,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
