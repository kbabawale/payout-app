import { InitiatePayoutDto } from 'src/transfer/dto/initiate-payout.dto';
import { MakePayoutDto } from 'src/transfer/dto/make-transfer.dto';

export interface IPayout {
  approvePayout: (initiatePayoutDto: InitiatePayoutDto) => void;
  validateBank: (accountNumber: string, bankCode: string) => void;
  getBankLists: () => Promise<IBank[]>;
  getBalances: () => Promise<number>;
}

export interface IBank {
  name: string;
  code: string;
  ussdTemplate: string;
  baseUssdCode: string;
  transferUssdTemplate: string;
}

export interface IDisbursementInitiateResponse {
  amount: number;
  reference: string;
  status: string;
  totalFee: string;
  dateCreated: string;
  destinationBankCode: string;
  desinationAccountNumber: string;
  destinationBankName: string;
  destinationAccountName: string;
}

export interface IAuthorizeTransferResponse
  extends IDisbursementInitiateResponse {}

export const IServiceProcessorToken = 'IServiceProcessor';
export const Currency = 'NGN';

export interface IServiceProcessor {
  bankList: () => Promise<IBank[]>;
  initiateTransfer: (
    payload: InitiatePayoutDto,
  ) => Promise<IDisbursementInitiateResponse>;
  authorizeTransfer: (
    payload: MakePayoutDto,
    reference: string,
  ) => Promise<IAuthorizeTransferResponse>;
  verifyBankAccount: (
    accountNumber: string,
    bankCode: string,
  ) => Promise<{
    accountNumber: string;
    accountName: string;
    bankCode: string;
  }>;
  resendOtp: () => void;
  bankBalance: () => Promise<number>;
}
