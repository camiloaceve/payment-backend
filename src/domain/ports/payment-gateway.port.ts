export interface PaymentGatewayRequest {
  amount: number;
  customerEmail: string;
  creditCardToken: string;
  installments: number;
  reference: string;
  customerData: { phoneNumber: string; fullName: string };
  billingData: { legalIdType: string; legalId: string };
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';

export interface PaymentGatewayPort {
  processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse>;
}
