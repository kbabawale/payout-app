import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class InitiatePayoutDto {
  @ApiProperty({ example: '5000' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  readonly amount: string;

  @ApiProperty({ example: '3100748834' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  readonly accountNumber: string;

  @ApiProperty({ example: '011' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  readonly bankCode: string;

  @ApiProperty({ example: '482939-2345432-2345432-432434' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  readonly userId: string;
}
