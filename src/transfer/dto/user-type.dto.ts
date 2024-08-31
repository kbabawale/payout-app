import { IsNotEmpty, MinLength } from 'class-validator';

export class UserTypeDto {
  @IsNotEmpty()
  @MinLength(4)
  readonly name: string;
}
