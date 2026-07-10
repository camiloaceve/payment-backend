import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PaymentGatewayPort, PaymentGatewayRequest, PaymentGatewayResponse } from '../../../domain/ports/payment-gateway.port';

@Injectable()
export class WompiSandboxPaymentGateway implements PaymentGatewayPort {
  private readonly apiUrl = 'https://api-sandbox.co.uat.wompi.dev/v1';
  private readonly publicKey = 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';
  
  constructor(private readonly httpService: HttpService) {}

  async processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    console.log(`[Wompi Sandbox] Sending real payment request for ${request.reference}...`);
    
    try {
      const payload = {
        amount_in_cents: request.amount * 100, // Wompi requires cents
        currency: 'COP',
        customer_email: request.customerEmail,
        payment_method: {
          type: 'CARD',
          token: request.creditCardToken,
          installments: request.installments,
        },
        reference: request.reference,
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/transactions`, payload, {
          headers: {
            Authorization: `Bearer ${this.publicKey}`,
          }
        })
      );

      const data = response.data?.data;
      
      // Statuses in Wompi: APPROVED, DECLINED, ERROR...
      if (data?.status === 'APPROVED') {
        return {
          success: true,
          transactionId: data.id,
        };
      }

      return {
        success: false,
        error: `Transaction not approved. Status: ${data?.status}`,
      };

    } catch (error: any) {
      console.error('[Wompi Sandbox] Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.messages || error.message,
      };
    }
  }
}
