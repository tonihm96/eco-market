export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  // Plain-text fallback, also used by the console sender to print links
  text?: string;
};

// Port: any e-mail provider must implement this contract
export interface EmailSender {
  readonly name: string;
  send: (message: EmailMessage) => Promise<void>;
}
