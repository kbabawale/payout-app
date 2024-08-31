import { Routes } from '@nestjs/core';
import { TransferModule } from './transfer/transfer.module';

export const routes: Routes = [
  {
    path: 'api/v1/payout',
    module: TransferModule,
  },
];
