import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

export interface ChangeEmailProps {
  username?: string;
  confirmationUrl: string;
}

const ChangeEmail = ({
  username = "Desenvolvedor",
  confirmationUrl,
}: ChangeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Confirme sua mudança de e-mail</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#0070f3",
                offwhite: "#fafafa",
              },
            },
          },
        }}
      >
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Confirme sua mudança de e-mail
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              Olá <strong>{username}</strong>,
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Recebemos uma solicitação para alterar o endereço de e-mail
              associado à sua conta no <strong>Eco Market</strong>. Para
              confirmar essa alteração, por favor clique no botão abaixo:
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={confirmationUrl}
              >
                Confirmar mudança de e-mail
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              ou copie e cole este link no seu navegador:
              <br />
              <Link
                href={confirmationUrl}
                className="text-blue-600 no-underline"
              >
                {confirmationUrl}
              </Link>
            </Text>

            <Text className="text-[#666666] text-[12px] leading-[24px] mt-[30px]">
              Se você não solicitou esta mudança de e-mail, por favor ignore
              este e-mail.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ChangeEmail.PreviewProps = {
  username: "Jhon Doe",
  confirmationUrl: "https://eco-market.com/auth/change-email?token=abc123",
} as ChangeEmailProps;

export default ChangeEmail;
