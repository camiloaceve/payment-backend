import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionLogRepository } from '../../../domain/ports/transaction-log.repository';
import { TransactionLog } from '../../../domain/models/transaction-log.model';
import { TransactionLogEntity } from '../../database/entities/transaction-log.entity';

@Injectable()
export class MysqlTransactionLogRepository implements TransactionLogRepository {
  constructor(
    @InjectRepository(TransactionLogEntity)
    private readonly repository: Repository<TransactionLogEntity>,
  ) {}

  async save(log: TransactionLog): Promise<void> {
    const entity = new TransactionLogEntity();
    entity.id = log.id;
    entity.transactionId = log.transactionId;
    entity.status = log.status;
    entity.timestamp = log.timestamp;
    entity.notes = log.notes || '';

    await this.repository.save(entity);
  }
}
