import env from "@/env";
import { createConsoleEmailSender } from "@/services/email/console-email-sender";
import type { EmailSender } from "@/services/email/email-sender";
import { createResendEmailSender } from "@/services/email/resend-email-sender";
import { createFakePaymentGateway } from "@/services/payment/fake-payment-gateway";
import type { PaymentGateway } from "@/services/payment/payment-gateway";

// Composition root: picks the adapters for each external integration
export type Container = {
  emailSender: EmailSender;
  paymentGateway: PaymentGateway;
};

const createEmailSender = (): EmailSender =>
  env.RESEND_API_KEY !== undefined
    ? createResendEmailSender(env.RESEND_API_KEY, env.RESEND_FROM_EMAIL)
    : createConsoleEmailSender();

const createPaymentGateway = (): PaymentGateway => {
  switch (env.PAYMENT_GATEWAY) {
    case "fake":
      return createFakePaymentGateway();
  }
};

export const container: Container = {
  emailSender: createEmailSender(),
  paymentGateway: createPaymentGateway(),
};
