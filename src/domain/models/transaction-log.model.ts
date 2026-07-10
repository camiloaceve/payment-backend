export class TransactionLog {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly status: string,
    public readonly timestamp: Date,
    public readonly notes?: string,
  ) {}
}
