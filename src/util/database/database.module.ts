import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import pg from 'pg';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get('POSTGRES_DIALECT'),
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USERNAME'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        autoLoadModels: true,
        synchronize: true,
        dialectModule: pg,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
