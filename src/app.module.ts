import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [TransferModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
