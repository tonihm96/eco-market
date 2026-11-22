import { randomUUIDv7 } from "bun";

import type { ChargeResult, PaymentGateway } from "./payment-gateway";

const buildInstructions = (method: string, reference: string, amount: number) => {
  switch (method) {
    case "pix":
      return `PIX simulado: 00020126EcoMarket${reference.slice(0, 12)}5204000053039865406${amount.toFixed(2)}`;
    case "boleto":
      return `Boleto simulado: 34191.79001 01043.510047 91020.150008 ${reference.slice(0, 6)}`;
    default:
      return null;
  }
};

// Placeholder adapter: approves every charge without contacting any provider
export const createFakePaymentGateway = (): PaymentGateway => ({
  name: "fake",
  charge: async ({ method, amount }): Promise<ChargeResult> => {
    const providerReference = `fake_${randomUUIDv7()}`;
    return {
      status: "approved",
      providerReference,
      instructions: buildInstructions(method, providerReference, amount),
    };
  },
});
