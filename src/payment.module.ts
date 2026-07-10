import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ProductEntity } from './infrastructure/database/entities/product.entity';
import { TransactionEntity } from './infrastructure/database/entities/transaction.entity';

// Controllers
import { PaymentController } from './infrastructure/controllers/payment.controller';

// Use Cases
import { ProcessPaymentUseCase } from './application/use-cases/process-payment.use-case';

// Ports (Tokens)
import { PRODUCT_REPOSITORY } from './domain/ports/product.repository';
import { TRANSACTION_REPOSITORY } from './domain/ports/transaction.repository';
import { PAYMENT_GATEWAY } from './domain/ports/payment-gateway.port';

// Adapters
import { MysqlProductRepository } from './infrastructure/adapters/persistence/mysql-product.repository';
import { MysqlTransactionRepository } from './infrastructure/adapters/persistence/mysql-transaction.repository';
import { WompiSandboxPaymentGateway } from './infrastructure/adapters/external/wompi-sandbox-payment.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, TransactionEntity]),
  ],
  controllers: [PaymentController],
  providers: [
    ProcessPaymentUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: MysqlProductRepository,
    },
    {
      provide: TRANSACTION_REPOSITORY,
      useClass: MysqlTransactionRepository,
    },
    {
      provide: PAYMENT_GATEWAY,
      useClass: WompiSandboxPaymentGateway,
    },
  ],
})
export class PaymentModule {}
