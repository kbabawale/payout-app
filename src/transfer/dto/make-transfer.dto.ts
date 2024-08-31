import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class MakePayoutDto {
  @ApiProperty({ example: '482939' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  readonly authorizationCode: string;

  @ApiProperty({ example: '482939-2345432-2345432-432434' })
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  readonly userId: string;
}
