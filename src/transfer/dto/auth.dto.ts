import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class AuthDto {
  @ApiProperty({ example: 'adminman@example.com' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/g)
  readonly email: string;

  @ApiProperty({ example: 'password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  readonly password: string;
}
