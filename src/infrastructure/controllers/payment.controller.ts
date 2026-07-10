import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ProcessPaymentUseCase, ProcessPaymentCommand } from '../../application/use-cases/process-payment.use-case';

export class ProcessPaymentDto {
  productId: string;
  amount: number;
  customerEmail: string;
  creditCardToken: string;
  installments: number;
}

@Controller('payments')
export class PaymentController {
  constructor(private readonly processPaymentUseCase: ProcessPaymentUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async processPayment(@Body() dto: ProcessPaymentDto) {
    const transaction = await this.processPaymentUseCase.execute({
      productId: dto.productId,
      amount: dto.amount,
      customerEmail: dto.customerEmail,
      creditCardToken: dto.creditCardToken,
      installments: dto.installments,
    });

    return {
      success: transaction.status === 'COMPLETED',
      transaction: {
        id: transaction.id,
        reference: transaction.reference,
        status: transaction.status,
      }
    };
  }
}
