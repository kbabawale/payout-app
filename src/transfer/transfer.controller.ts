import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { Payout } from './services/payout/payout.service';
import { InitiatePayoutDto } from './dto/initiate-payout.dto';
import { IBank } from 'src/util/model/payout.model';
import { ResponseFormat } from 'src/util/model/response.model';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import { JwtAuthGuard } from 'src/util/jwt/jwt.guard';
import { MakePayoutDto } from './dto/make-transfer.dto';

@Controller()
export class TransferController {
  constructor(private readonly payoutService: Payout) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiTags('Payout')
  @Post('initiate')
  async create(
    @Body() initiatePayoutDto: InitiatePayoutDto,
  ): Promise<ResponseFormat<any>> {
    const result = await this.payoutService.approvePayout(initiatePayoutDto);

    let obj: ResponseFormat<any> = {
      message: result,
      data: null,
    };
    return obj;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiTags('Payout')
  @Post('transfer')
  async transfer(
    @Body() makePayoutDto: MakePayoutDto,
  ): Promise<ResponseFormat<any>> {
    const result = await this.payoutService.authoriseTransfer(makePayoutDto);

    let obj: ResponseFormat<any> = {
      message: result,
      data: null,
    };
    return obj;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt-auth')
  @ApiTags('Payout')
  @Get('/bank')
  async findBanks(): Promise<ResponseFormat<IBank[]>> {
    const banks = await this.payoutService.getBankLists();

    let obj: ResponseFormat<IBank[]> = {
      message: 'Banks Retrieved',
      data: banks,
      meta: {},
    };
    return obj;
  }

  @ApiTags('Auth')
  @Post('login')
  async authenticate(@Body() authDto: AuthDto): Promise<ResponseFormat<any>> {
    const result = await this.payoutService.authenticate(authDto);

    let obj: ResponseFormat<any> = {
      message: 'Login successful',
      data: result,
    };
    return obj;
  }
}
