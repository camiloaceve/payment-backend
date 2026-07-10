import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';
import { ProcessPaymentDto } from '../dtos/process-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly processPaymentUseCase: ProcessPaymentUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async processPayment(@Body() dto: ProcessPaymentDto) {
    try {
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
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
