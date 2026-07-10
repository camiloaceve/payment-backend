import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ProductEntity } from './infrastructure/database/entities/product.entity';
import { TransactionEntity } from './infrastructure/database/entities/transaction.entity';

// Controllers
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { ProductController } from './infrastructure/controllers/product.controller';

// Use Cases
import { ProcessPaymentUseCase } from './application/use-cases/process-payment.use-case';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';

// Ports (Tokens)
import { PRODUCT_REPOSITORY } from './domain/ports/product.repository';
import { TRANSACTION_REPOSITORY } from './domain/ports/transaction.repository';
import { PAYMENT_GATEWAY } from './domain/ports/payment-gateway.port';

// Adapters
import { MysqlProductRepository } from './infrastructure/adapters/persistence/mysql-product.repository';
import { MysqlTransactionRepository } from './infrastructure/adapters/persistence/mysql-transaction.repository';
import { WompiSandboxPaymentGateway } from './infrastructure/adapters/external/wompi-sandbox-payment.gateway';

import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, TransactionEntity]),
    HttpModule,
  ],
  controllers: [PaymentController, ProductController],
  providers: [
    ProcessPaymentUseCase,
    GetProductsUseCase,
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
