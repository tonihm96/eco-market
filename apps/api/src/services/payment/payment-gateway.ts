import type { PaymentMethod, PaymentStatus } from "@eco-market/shared";

export type ChargeRequest = {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  customer: { id: string; name: string; email: string };
};

export type ChargeResult = {
  status: PaymentStatus;
  providerReference: string;
  // Human readable instructions (Pix code, boleto line, etc.)
  instructions: string | null;
};

// Port: Stripe, Mercado Pago, etc. must implement this contract
export interface PaymentGateway {
  readonly name: string;
  charge: (request: ChargeRequest) => Promise<ChargeResult>;
}
