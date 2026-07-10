export interface ProcessPaymentCommand {
  productId: string;
  amount: number;
  customerEmail: string;
  creditCardToken: string;
  installments: number;
}
