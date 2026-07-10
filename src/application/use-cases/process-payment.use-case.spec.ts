import { ProcessPaymentUseCase } from './process-payment.use-case';
import { Product } from '../../domain/models/product.model';
import { Transaction, TransactionStatus } from '../../domain/models/transaction.model';
import { TransactionLog } from '../../domain/models/transaction-log.model';
import { ProductRepository } from '../../domain/ports/product.repository';
import { TransactionRepository } from '../../domain/ports/transaction.repository';
import { TransactionLogRepository } from '../../domain/ports/transaction-log.repository';
import { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let mockProductRepo: jest.Mocked<ProductRepository>;
  let mockTransactionRepo: jest.Mocked<TransactionRepository>;
  let mockTransactionLogRepo: jest.Mocked<TransactionLogRepository>;
  let mockPaymentGateway: jest.Mocked<PaymentGatewayPort>;

  beforeEach(() => {
    mockProductRepo = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
    };
    mockTransactionRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockTransactionLogRepo = {
      save: jest.fn(),
    };
    mockPaymentGateway = {
      processPayment: jest.fn(),
    };

    useCase = new ProcessPaymentUseCase(
      mockProductRepo,
      mockTransactionRepo,
      mockTransactionLogRepo,
      mockPaymentGateway,
    );
  });

  const validCommand = {
    productId: 'prod-1',
    amount: 150000,
    customerEmail: 'test@test.com',
    creditCardToken: 'tok_123',
    installments: 1,
  };

  it('should throw error if product not found', async () => {
    mockProductRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(validCommand)).rejects.toThrow('Product not found');
  });

  it('should throw error if product is out of stock', async () => {
    const product = new Product('prod-1', 'Test', 150000, 0);
    mockProductRepo.findById.mockResolvedValue(product);

    await expect(useCase.execute(validCommand)).rejects.toThrow('Product is out of stock');
  });

  it('should throw error if payment amount does not match product price', async () => {
    const product = new Product('prod-1', 'Test', 200000, 10);
    mockProductRepo.findById.mockResolvedValue(product);

    await expect(useCase.execute(validCommand)).rejects.toThrow('Payment amount does not match product price');
  });

  it('should process successful payment, update transaction, decrease stock and log', async () => {
    const product = new Product('prod-1', 'Test', 150000, 10);
    mockProductRepo.findById.mockResolvedValue(product);
    
    mockPaymentGateway.processPayment.mockResolvedValue({
      success: true,
      transactionId: 'wompi-123',
    });

    const result = await useCase.execute(validCommand);

    // Verify transaction object returned
    expect(result.status).toBe(TransactionStatus.COMPLETED);
    expect(result.amount).toBe(150000);
    
    // Verify product stock decreased
    expect(product.stock).toBe(9);
    expect(mockProductRepo.save).toHaveBeenCalledWith(product);

    // Verify transaction saves (PENDING and COMPLETED)
    expect(mockTransactionRepo.save).toHaveBeenCalledTimes(2);

    // Verify logs
    expect(mockTransactionLogRepo.save).toHaveBeenCalledTimes(2);
  });

  it('should fail transaction if Wompi rejects', async () => {
    const product = new Product('prod-1', 'Test', 150000, 10);
    mockProductRepo.findById.mockResolvedValue(product);
    
    mockPaymentGateway.processPayment.mockResolvedValue({
      success: false,
      error: 'DECLINED',
    });

    const result = await useCase.execute(validCommand);

    expect(result.status).toBe(TransactionStatus.FAILED);
    expect(product.stock).toBe(10); // Stock should not change
    expect(mockProductRepo.save).not.toHaveBeenCalled();
    expect(mockTransactionRepo.save).toHaveBeenCalledTimes(2);
  });
});
