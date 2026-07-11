import { Injectable, Inject } from '@nestjs/common';
import { Transaction, TransactionStatus } from '../../domain/models/transaction.model';
import { PRODUCT_REPOSITORY } from '../../domain/ports/product.repository';
import type { ProductRepository } from '../../domain/ports/product.repository';
import { TRANSACTION_REPOSITORY } from '../../domain/ports/transaction.repository';
import type { TransactionRepository } from '../../domain/ports/transaction.repository';
import { TRANSACTION_LOG_REPOSITORY } from '../../domain/ports/transaction-log.repository';
import type { TransactionLogRepository } from '../../domain/ports/transaction-log.repository';
import { PAYMENT_GATEWAY } from '../../domain/ports/payment-gateway.port';
import type { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { ProcessPaymentCommand } from '../interfaces/process-payment.command';
import { TransactionLog } from '../../domain/models/transaction-log.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
    @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: TransactionRepository,
    @Inject(TRANSACTION_LOG_REPOSITORY) private readonly transactionLogRepository: TransactionLogRepository,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<Transaction> {
    // 1. Validate Product & Stock
    const product = await this.productRepository.findById(command.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.hasSufficientStock(command.quantity)) {
      throw new Error('Product is out of stock for the requested quantity');
    }

    const expectedAmount = product.price * command.quantity;
    if (expectedAmount !== command.amount) {
      throw new Error('Payment amount does not match product price * quantity');
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
    await this.transactionLogRepository.save(
      new TransactionLog(uuidv4(), transactionId, TransactionStatus.PENDING, new Date(), 'Transaction created')
    );

    try {
      // 3. Call Wompi Payment API via Port
      const response = await this.paymentGateway.processPayment({
        amount: command.amount,
        customerEmail: command.customerEmail,
        creditCardToken: command.creditCardToken,
        installments: command.installments,
        reference: transaction.reference,
        customerData: command.customerData,
        billingData: command.billingData,
      });

      // 4. Handle Gateway Response
      if (response.success) {
        transaction.markAsCompleted();
        product.decreaseStock(command.quantity);
        await this.productRepository.save(product); // Update stock in DB
        await this.transactionLogRepository.save(
          new TransactionLog(uuidv4(), transactionId, TransactionStatus.COMPLETED, new Date(), 'Payment approved by Wompi')
        );
      } else {
        transaction.markAsFailed();
        await this.transactionLogRepository.save(
          new TransactionLog(uuidv4(), transactionId, TransactionStatus.FAILED, new Date(), `Payment rejected: ${response.error}`)
        );
      }

    } catch (error) {
      // In case of a network or unexpected error, mark as failed
      transaction.markAsFailed();
      await this.transactionLogRepository.save(
        new TransactionLog(uuidv4(), transactionId, TransactionStatus.FAILED, new Date(), 'System error during payment')
      );
    }

    // Save final transaction state
    await this.transactionRepository.save(transaction);
    return transaction;
  }
}
