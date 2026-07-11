export interface ProcessPaymentCommand {
  productId: string;
  amount: number;
  customerEmail: string;
  creditCardToken: string;
  installments: number;
  customerData: { phoneNumber: string; fullName: string };
  billingData: { legalIdType: string; legalId: string };
}
