import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { AuthDto } from 'src/transfer/dto/auth.dto';
import { InitiatePayoutDto } from 'src/transfer/dto/initiate-payout.dto';
import { MakePayoutDto } from 'src/transfer/dto/make-transfer.dto';
import {
  Transaction,
  TransactionStatus,
} from 'src/transfer/entities/transaction.entity';
import { UserType } from 'src/transfer/entities/user-type.entity';
import { User } from 'src/transfer/entities/user.entity';
import { getCache, setCache } from 'src/util/cache/config.cache';
import { comparePasswords } from 'src/util/hash.util';
import { generateJWT } from 'src/util/jwt/token.helper';
import {
  IPayout,
  IServiceProcessor,
  IServiceProcessorToken,
} from 'src/util/model/payout.model';
/**
 * Class to be injected into controller
 * Class will be used for facilitating various payout operations through 3rd party services using platform agnostic approach
 */

@Injectable()
export class Payout implements IPayout {
  /**
   * Inject abstraction of dependencies as needed
   */

  constructor(
    @Inject(IServiceProcessorToken)
    private readonly paymentProcessor: IServiceProcessor,
    @InjectModel(Transaction)
    private readonly transactionModel: typeof Transaction,
    @InjectModel(User) private readonly userModel: typeof User,
    public config: ConfigService,
  ) {}

  validateBank(accountNumber: string, bankCode: string) {
    return this.paymentProcessor.verifyBankAccount(accountNumber, bankCode);
  }

  getBankLists() {
    return this.paymentProcessor.bankList();
  }

  getBalances() {
    return this.paymentProcessor.bankBalance();
  }

  /**
   * Checks if theres sufficient balance before initiating a transaction
   * @param payload destination account number, bank code and amount
   */
  async approvePayout(payload: InitiatePayoutDto) {
    //check balance
    const balance = await this.getBalances();

    if (balance <= 0 || balance < parseFloat(payload.amount)) {
      throw new HttpException(
        {
          data: {},
          meta: {},
          message: 'Insufficient balance',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    //validate destination bank account
    const validationResult = await this.validateBank(
      payload.accountNumber,
      payload.bankCode,
    );
    if (!validationResult.accountName) {
      throw new HttpException(
        {
          data: {},
          meta: {},
          message: 'Destination Bank Account Not Ascertained',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    //initiate transaction
    const initiated = await this.paymentProcessor.initiateTransfer(payload);
    if (initiated.status === 'PENDING_AUTHORIZATION') {
      //save reference in cache for authorization purpose later
      await setCache(payload.userId, initiated.reference, 600000); //10 minute expiration

      return 'Payment Initiated. An OTP will be sent to your email address';
    } else {
      return 'Payment Initiated.';
    }
  }

  async authenticate(payload: AuthDto) {
    const user = await this.userModel.findOne({
      where: { email: payload.email },
      include: [UserType],
    });
    if (!user) {
      throw new HttpException(
        {
          data: {},
          meta: {},
          message: 'Incorrect Login Details',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    //check if password matches
    const hashedPassword = user.dataValues.password;
    const checkPassword = await comparePasswords(
      payload.password,
      hashedPassword,
    );
    if (!checkPassword) {
      throw new HttpException(
        {
          data: {},
          meta: {},
          message: 'Incorrect Login Details',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const jwtPayload = {
        type: 'ADMIN',
        email: payload.email,
        sub: user.dataValues.id,
      };
      const accesstoken = await generateJWT(
        jwtPayload,
        this.config.get('JWT_SECRET'),
      );

      const { password, createdAt, updatedAt, userTypeId, userType, ...rest } =
        user.dataValues;

      return {
        ...rest,
        type: user.dataValues.userType['name'],
        access_token: accesstoken,
      };
    }
  }

  async authoriseTransfer(makePayoutDto: MakePayoutDto) {
    // fetch reference number from cache
    const reference = (await getCache(makePayoutDto.userId)) as string;
    if (!reference) {
      throw new HttpException(
        {
          data: {},
          meta: {},
          message: 'Could not process transfer. Try again later.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const authorized = await this.paymentProcessor.authorizeTransfer(
      makePayoutDto,
      reference,
    );

    if (authorized) {
      await this.transactionModel.create({
        reference: authorized.reference,
        amount: authorized.amount,
        userId: makePayoutDto.userId,
        status: TransactionStatus.AUTHORIZED,
      });
      return 'Transfer Authorized';
    }
  }
}
