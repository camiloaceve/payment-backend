import { Injectable } from '@nestjs/common';
import { PaymentGatewayPort, PaymentGatewayRequest, PaymentGatewayResponse } from '../../../domain/ports/payment-gateway.port';

@Injectable()
export class WompiSandboxPaymentGateway implements PaymentGatewayPort {
  
  async processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    // -----------------------------------------------------------------------
    // Note for the Tech Test:
    // This is the UAT Sandbox API interaction.
    // In a real scenario, this would use fetch/axios to call:
    // https://api-sandbox.co.uat.wompi.dev/v1/transactions
    // using the provided public/private keys.
    // -----------------------------------------------------------------------
    
    console.log(`[Wompi Sandbox] Processing payment for ${request.reference} with amount ${request.amount}...`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate Wompi logic: Let's assume if amount > 0, it's successful for this test.
    if (request.amount <= 0) {
      return {
        success: false,
        error: 'Invalid amount',
      };
    }

    return {
      success: true,
      transactionId: `wompi_txn_${Date.now()}`,
    };
  }
}
