import { Resend } from "resend";

import type { EmailSender } from "./email-sender";

export const createResendEmailSender = (apiKey: string, from: string): EmailSender => {
  const resend = new Resend(apiKey);

  return {
    name: "resend",
    send: async ({ to, subject, html, text }) => {
      const response = await resend.emails.send({ from, to, subject, html, text });
      if (response.error !== null) {
        throw new Error(`Resend error: ${response.error.message}`);
      }
    },
  };
};
