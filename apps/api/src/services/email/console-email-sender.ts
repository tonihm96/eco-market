import type { EmailSender } from "./email-sender";

// Development adapter: prints the e-mail instead of sending it
export const createConsoleEmailSender = (): EmailSender => ({
  name: "console",
  send: async ({ to, subject, text }) => {
    console.info(`\n[email:console] to=${to}\n  subject: ${subject}\n  ${text ?? "(html only)"}\n`);
  },
});
