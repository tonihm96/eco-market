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

export interface VerifyEmailProps {
  username?: string;
  verificationUrl: string;
}

const VerifyEmail = ({
  username = "Desenvolvedor",
  verificationUrl,
}: VerifyEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verifique seu e-mail para acessar o App</Preview>
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
              Verifique seu e-mail
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              Olá <strong>{username}</strong>,
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Obrigado por se cadastrar no <strong>Eco Market</strong>. Para
              começar a usar o aplicativo, por favor confirme seu endereço de
              e-mail clicando no botão abaixo:
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-brand rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={verificationUrl}
              >
                Confirmar E-mail
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              ou copie e cole este link no seu navegador:
              <br />
              <Link
                href={verificationUrl}
                className="text-blue-600 no-underline"
              >
                {verificationUrl}
              </Link>
            </Text>

            <Text className="text-[#666666] text-[12px] leading-[24px] mt-[30px]">
              Se você não solicitou esta verificação, por favor ignore este
              e-mail.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VerifyEmail.PreviewProps = {
  username: "Jhon Doe",
  verificationUrl: "https://eco-market.com/auth/verify-email?token=abc123",
} as VerifyEmailProps;

export default VerifyEmail;
