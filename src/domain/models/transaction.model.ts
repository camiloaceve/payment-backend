export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class Transaction {
  constructor(
    public readonly id: string,
    public reference: string,
    public amount: number,
    public status: TransactionStatus,
    public productId: string,
    public customerEmail: string,
  ) {}

  public markAsCompleted(): void {
    this.status = TransactionStatus.COMPLETED;
  }

  public markAsFailed(): void {
    this.status = TransactionStatus.FAILED;
  }
}
