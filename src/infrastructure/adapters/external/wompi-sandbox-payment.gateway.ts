import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PaymentGatewayPort, PaymentGatewayRequest, PaymentGatewayResponse } from '../../../domain/ports/payment-gateway.port';

@Injectable()
export class WompiSandboxPaymentGateway implements PaymentGatewayPort {
  private readonly apiUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  
  constructor(
    private readonly httpService: HttpService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('WOMPI_API_URL') || 'https://sandbox.wompi.co/v1';
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

      // 2. Prepare payload exactly as Wompi Sandbox expects it for 3DS / Anti-fraud
      const payload = {
        amount_in_cents: request.amount * 100, // Wompi expects cents
        currency: 'COP',
        customer_email: request.customerEmail,
        payment_method_type: 'CARD',
        payment_method: {
          type: 'CARD',
          token: request.creditCardToken,
          installments: request.installments,
          is_click_to_pay: false,
        },
        reference: request.reference,
        acceptance_token: acceptanceToken,
        accept_personal_auth: personalAuthToken,
        is_three_ds: true,
        session_id: `session_${Date.now()}`,
        merchant_user_id: `user_${request.customerEmail}`,
        customer_number_prefix: '+57',
        customer_data: {
          phone_number: request.customerData.phoneNumber,
          full_name: request.customerData.fullName,
        },
        billing_data: {
          legal_id_type: request.billingData.legalIdType,
          legal_id: request.billingData.legalId,
        },
        signature: null,
      };

      console.log(`[Wompi Sandbox] Sending real payment request for ${request.reference}...`);
      
      // 3. Send transaction
      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/transactions`, payload, {
          headers: {
            Authorization: `Bearer ${this.publicKey}`, // Wompi Sandbox checkout uses Public Key
          },
        }),
      );

      let wompiStatus = response.data.data.status;
      const transactionId = response.data.data.id;
      console.log(`[Wompi Sandbox] Transaction created with status: ${wompiStatus}`);

      // Polling loop if the transaction is PENDING
      let attempts = 0;
      while (wompiStatus === 'PENDING' && attempts < 5) {
        attempts++;
        console.log(`[Wompi Sandbox] Polling transaction ${transactionId} (Attempt ${attempts}/5)...`);
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
        
        const pollResponse = await firstValueFrom(
          this.httpService.get(`${this.apiUrl}/transactions/${transactionId}`, {
            headers: {
              Authorization: `Bearer ${this.publicKey}`,
            },
          })
        );
        wompiStatus = pollResponse.data.data.status;
        console.log(`[Wompi Sandbox] Transaction ${transactionId} status is now: ${wompiStatus}`);
      }

      return {
        success: wompiStatus === 'APPROVED',
        transactionId: transactionId,
        error: wompiStatus !== 'APPROVED' ? `Wompi returned status: ${wompiStatus}` : undefined,
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
