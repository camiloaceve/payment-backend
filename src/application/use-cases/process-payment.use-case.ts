import { Injectable, Inject } from '@nestjs/common';
import { Transaction, TransactionStatus } from '../../domain/models/transaction.model';
import { PRODUCT_REPOSITORY } from '../../domain/ports/product.repository';
import type { ProductRepository } from '../../domain/ports/product.repository';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/transaction.repository';
import type { TransactionRepository } from '../../domain/ports/transaction.repository';
import { PAYMENT_GATEWAY } from '../../domain/ports/payment-gateway.port';
import type { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessPaymentCommand {
  productId: string;
  amount: number;
  customerEmail: string;
  creditCardToken: string;
  installments: number;
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepository,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<Transaction> {
    // 1. Validate Product & Stock
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.hasSufficientStock()) {
      throw new Error('Product is out of stock');
    }

    // 2. Create Transaction in PENDING state
    const transactionId = uuidv4();
    const reference = `REF-${Date.now()}-${transactionId.substring(0, 8)}`;
    
    const transaction = new Transaction(
      transactionId,
      reference,
      command.amount,
      TransactionStatus.PENDING,
      command.productId,
      command.customerEmail,
    );
    await this.transactionRepository.save(transaction);

    try {
      // 3. Call Wompi Payment API via Port
      const response = await this.paymentGateway.processPayment({
        reference: transaction.reference,
        amount: transaction.amount,
        customerEmail: transaction.customerEmail,
        creditCardToken: command.creditCardToken,
        installments: command.installments,
      });

      // 4. Update transaction based on response and handle stock
      if (response.success) {
        transaction.markAsCompleted();
        product.decreaseStock();
        await this.productRepository.save(product); // Update stock in DB
      } else {
        transaction.markAsFailed();
      }

    } catch (error) {
      // In case of a network or unexpected error, mark as failed
      transaction.markAsFailed();
    }

    // Save final transaction state
    await this.transactionRepository.save(transaction);

    return transaction;
  }
}
