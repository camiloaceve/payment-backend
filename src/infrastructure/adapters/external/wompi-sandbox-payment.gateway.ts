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
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY') || '';
  }

  async processPayment(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    try {
      // 1. Get Merchant Acceptance Tokens (Required by Wompi Colombia)
      const merchantResponse = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/merchants/${this.publicKey}`)
      );
      
      const acceptanceToken = merchantResponse.data.data.presigned_acceptance.acceptance_token;
      const personalAuthToken = merchantResponse.data.data.presigned_personal_data_auth.acceptance_token;

      // 2. Prepare payload exactly as Wompi Sandbox expects it
      const payload = {
        amount_in_cents: request.amount * 100, // Wompi expects cents
        currency: 'COP',
        customer_email: request.customerEmail,
        payment_method: {
          type: 'CARD',
          token: request.creditCardToken,
          installments: request.installments,
        },
        reference: request.reference,
        acceptance_token: acceptanceToken,
        accept_personal_auth: personalAuthToken,
      };

      console.log(`[Wompi Sandbox] Sending real payment request for ${request.reference}...`);
      
      // 3. Send transaction
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/transactions`, payload, {
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
          },
        }),
      );

      return {
        success: response.data.data.status === 'APPROVED',
        transactionId: response.data.data.id,
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
