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

export interface ResetPasswordProps {
  username?: string;
  resetPasswordUrl: string;
}

const ResetPassword = ({
  username = "Desenvolvedor",
  resetPasswordUrl,
}: ResetPasswordProps) => {
  return (
    <Html>
      <Head />
      <Preview>Redefina sua senha para acessar o App</Preview>
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
              Redefina sua senha
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              Olá <strong>{username}</strong>,
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Recebemos uma solicitação para redefinir sua senha. Para
              prosseguir, clique no botão abaixo:
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                href={resetPasswordUrl}
                className="bg-brand text-white text-[14px] font-medium no-underline px-[24px] py-[12px] rounded"
              >
                Redefinir Senha
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              Se você não solicitou essa alteração, pode ignorar este e-mail com
              segurança.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              ou copie e cole este link no seu navegador:
              <br />
              <Link
                href={resetPasswordUrl}
                className="text-blue-600 no-underline"
              >
                {resetPasswordUrl}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

ResetPassword.PreviewProps = {
  username: "Jhon Doe",
  resetPasswordUrl: "https://eco-market.com/auth/reset-password?token=abc123",
} as ResetPasswordProps;

export default ResetPassword;
