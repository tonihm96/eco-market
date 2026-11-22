import { createApp } from "@/app";
import { container } from "@/container";
import env from "@/env";

const app = (await createApp(container)).listen(env.SERVER_PORT);

console.log(`Eco Market API running at ${app.server?.url}`);
console.log(`OpenAPI docs at ${app.server?.url}docs`);
console.log(
  `Adapters: email=${container.emailSender.name} payment=${container.paymentGateway.name}`,
);
