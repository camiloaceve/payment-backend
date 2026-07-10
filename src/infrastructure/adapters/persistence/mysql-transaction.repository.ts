import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepository } from '../../../domain/ports/transaction.repository';
import { Transaction, TransactionStatus } from '../../../domain/models/transaction.model';
import { TransactionEntity } from '../../database/entities/transaction.entity';

@Injectable()
export class MysqlTransactionRepository implements TransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>,
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;

    return new Transaction(
      entity.id,
      entity.reference,
      Number(entity.amount),
      entity.status as TransactionStatus,
      entity.productId,
      entity.customerEmail,
    );
  }

  async save(transaction: Transaction): Promise<void> {
    const entity = new TransactionEntity();
    entity.id = transaction.id;
    entity.reference = transaction.reference;
    entity.amount = transaction.amount;
    entity.status = transaction.status;
    entity.productId = transaction.productId;
    entity.customerEmail = transaction.customerEmail;

    await this.repository.save(entity);
  }
}
