import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PaymentGatewayPort, PaymentGatewayRequest, PaymentGatewayResponse } from '../../../domain/ports/payment-gateway.port';

@Injectable()
export class WompiSandboxPaymentGateway implements PaymentGatewayPort {
  private readonly apiUrl: string;
  private readonly publicKey: string;
  
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('WOMPI_API_URL') || 'https://api-sandbox.co.uat.wompi.dev/v1';
    this.publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY') || '';
  }

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
      const errorData = error.response?.data;
      console.error('[Wompi Sandbox] Error:', JSON.stringify(errorData, null, 2) || error.message);
      
      let errorMessage = error.message;
      if (errorData?.error?.messages) {
        errorMessage = JSON.stringify(errorData.error.messages);
      } else if (errorData?.error?.reason) {
        errorMessage = errorData.error.reason;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
