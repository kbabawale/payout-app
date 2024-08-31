import { Module } from '@nestjs/common';
import { TransferService } from './services/transfer/transfer.service';
import { TransferController } from './transfer.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserType } from './entities/user-type.entity';
import { Payout } from './services/payout/payout.service';
import { IServiceProcessorToken } from 'src/util/model/payout.model';
import { MonnifyProcessor } from './services/monnify/monnify.service';
import { ConfigService } from '@nestjs/config';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [SequelizeModule.forFeature([User, UserType, Transaction])],
  controllers: [TransferController],
  providers: [
    TransferService,
    Payout,
    {
      //IOC for specifying which 3rd party service to use whenever 'IServiceProcessor' interface is requested
      //For any other service like Flutterwave, the 'useFactory' function will be refactored to specify FlutterwaveProcessor class
      provide: IServiceProcessorToken,
      useFactory: async (configService: ConfigService) => {
        const APIKey = configService.get('MONNIFY_API_KEY');
        const APISecret = configService.get('MONNIFY_SECRET_KEY');
        const host = configService.get('MONNIFY_HOST');
        const host2 = configService.get('MONNIFY_HOST2');
        const accountNumber = configService.get('MONNIFY_ACCOUNT_NUMBER');
        const token = btoa(`${APIKey}:${APISecret}`);
        const finalToken = `Basic ${token}`;
        return new MonnifyProcessor(finalToken, host, host2, accountNumber);
      },
      inject: [ConfigService],
    },
  ],
})
export class TransferModule {}
