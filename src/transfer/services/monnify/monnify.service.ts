import {
  Currency,
  IBank,
  IServiceProcessor,
} from 'src/util/model/payout.model';
import fetch from 'node-fetch';
import { InitiatePayoutDto } from 'src/transfer/dto/initiate-payout.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { generatePaymentReference } from 'src/util/reference-generator.util';
import { getCache, setCache } from 'src/util/cache/config.cache';
import { MakePayoutDto } from 'src/transfer/dto/make-transfer.dto';

/**
 * Concrete implementation of Monnify API
 */
export class Monnify {
  async generateAccessToken(host: string, token: string) {
    const cachedAccessToken = (await getCache('monnifyAccessToken')) as string;
    if (cachedAccessToken) {
      return cachedAccessToken;
    }

    const response = await fetch(`${host}/auth/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `${token}`,
      },
    });

    const data = (await response.json()) as unknown as MonnifyResponse<{
      accessToken: string;
      expiresIn: number;
    }>;

    if (!response.ok) {
      throw new HttpException(
        {
          data: {},
          meta: {},
          message: data['error_description'],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    setCache(
      'monnifyAccessToken',
      data.responseBody.accessToken,
      data.responseBody.expiresIn * 1000,
    );
    return data.responseBody.accessToken;
  }

  async retrieveBanks(host: string, token: string) {
    const accessToken = await this.generateAccessToken(host, token);

    const response = await fetch(`${host}/banks`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = (await response.json()) as unknown as MonnifyResponse<IBank[]>;

    if (!response.ok) {
      throw new HttpException(
        {
          data: {},
          meta: {},
          message: data['error_description'],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data.responseBody;
  }

  async retrieveBankBalance(
    host1: string,
    host2: string,
    token: string,
    accountNumber: number,
  ) {
    const accessToken = await this.generateAccessToken(host1, token);

    const response = await fetch(
      `${host2}/disbursements/wallet-balance?accountNumber=${accountNumber}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const data = (await response.json()) as unknown as MonnifyResponse<{
      availableBalance: number;
      ledgerBalance: number;
    }>;

    if (!response.ok) {
      throw new HttpException(
        {
          data: {},
          meta: {},
          message: data['error_description'],
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data.responseBody.availableBalance;
  }

  async validateBankAccount(
    host: string,
    token: string,
    accountNumber: string,
    bankCode: string,
  ) {
    const accessToken = await this.generateAccessToken(host, token);

    const response = await fetch(
      `${host}/disbursements/account/validate?accountNumber=${accountNumber}&bankCode=${bankCode}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = (await response.json()) as unknown as MonnifyResponse<{
      accountNumber: string;
      accountName: string;
      bankCode: string;
    }>;

    if (!response.ok) {
      throw new HttpException(
        {
          data: {},
          meta: {},
          message: data.responseMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data.responseBody;
  }

  async initiateSingleDisbursement(
    host1: string,
    host2: string,
    token: string,
    payload: MonnifyDisbursementInitiateRequest,
  ) {
    const accessToken = await this.generateAccessToken(host1, token);

    const response = await fetch(`${host2}/disbursements/single`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data =
      (await response.json()) as unknown as MonnifyResponse<MonnifyDisbursementInitiateResponse>;

    if (!response.ok) {
      throw new HttpException(
        {
          data: {},
          meta: {},
          message: data.responseMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data.responseBody;
  }

  async authorizeTransfer(
    host1: string,
    host2: string,
    token: string,
    payload: MonnifyMakeTransferRequest,
    reference: string,
  ) {
    const accessToken = await this.generateAccessToken(host1, token);

    const response = await fetch(`${host2}/disbursements/single/validate-otp`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data =
      (await response.json()) as unknown as MonnifyResponse<MonnifyMakeTransferResponse>;

    if (!response.ok) {
      throw new HttpException(
        {
          data: {},
          meta: {},
          message: data.responseMessage,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return data.responseBody;
  }
}

/**
 *
 */
export class MonnifyProcessor implements IServiceProcessor {
  readonly token: string;
  readonly host: string;
  readonly host2: string;
  readonly accountNumber: number;

  constructor(
    token: string,
    host: string,
    host2: string,
    accountNumber: number,
  ) {
    this.token = token;
    this.host = host;
    this.host2 = host2;
    this.accountNumber = accountNumber;
  }

  async bankBalance() {
    let monnifyInstance = new Monnify();
    return monnifyInstance.retrieveBankBalance(
      this.host,
      this.host2,
      this.token,
      this.accountNumber,
    );
  }

  async bankList() {
    let monnifyInstance = new Monnify();
    return monnifyInstance.retrieveBanks(this.host, this.token);
  }

  initiateTransfer(payload: InitiatePayoutDto) {
    let monnifyInstance = new Monnify();
    const newPayload: MonnifyDisbursementInitiateRequest = {
      amount: parseFloat(payload.amount),
      currency: Currency,
      desinationAccountNumber: payload.accountNumber,
      destinationBankCode: payload.bankCode,
      narration: 'Single Bank Transfer',
      reference: generatePaymentReference(),
      sourceAccountNumber: this.accountNumber.toString(),
      //   async: true,
    };
    return monnifyInstance.initiateSingleDisbursement(
      this.host,
      this.host2,
      this.token,
      newPayload,
    );
  }

  authorizeTransfer(payload: MakePayoutDto, reference: string) {
    let monnifyInstance = new Monnify();
    return monnifyInstance.authorizeTransfer(
      this.host,
      this.host2,
      this.token,
      payload,
      reference,
    );
  }

  verifyBankAccount(accountNumber: string, bankCode: string) {
    let monnifyInstance = new Monnify();
    return monnifyInstance.validateBankAccount(
      this.host,
      this.token,
      accountNumber,
      bankCode,
    );
  }

  resendOtp: () => void;
}

export interface MonnifyDisbursementInitiateRequest {
  amount: number;
  reference: string;
  narration: string;
  destinationBankCode: string;
  desinationAccountNumber: string;
  currency: string;
  sourceAccountNumber: string;
  async?: boolean;
}
export interface MonnifyDisbursementInitiateResponse {
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

export interface MonnifyMakeTransferRequest {
  authorizationCode: string;
}

export interface MonnifyMakeTransferResponse
  extends MonnifyDisbursementInitiateResponse {}

export interface MonnifyResponse<T = {}> {
  requestSuccessful: boolean;
  responseMessage: string;
  responseCode: string;
  responseBody?: T;
}
