export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';

export interface PaymentGatewayRequest {
  reference: string;
  amount: number;
  customerEmail: string;
  creditCardToken: string;
  installments: number;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface PaymentGatewayPort {
  processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse>;
}
