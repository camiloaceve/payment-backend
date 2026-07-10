import { TransactionLog } from '../models/transaction-log.model';

export const TRANSACTION_LOG_REPOSITORY = 'TRANSACTION_LOG_REPOSITORY';

export interface TransactionLogRepository {
  save(log: TransactionLog): Promise<void>;
}
