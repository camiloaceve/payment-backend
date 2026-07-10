import { IsString, IsNumber, IsEmail, IsNotEmpty, Min } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsEmail()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  creditCardToken: string;

  @IsNumber()
  @Min(1)
  installments: number;
}
