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

export interface DeleteAccountProps {
  username?: string;
  deleteAccountUrl: string;
}

const DeleteAccount = ({
  username = "Desenvolvedor",
  deleteAccountUrl,
}: DeleteAccountProps) => {
  return (
    <Html>
      <Head />
      <Preview>Confirme a exclusão da sua conta</Preview>
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
              Excluir Conta
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Olá <strong>{username}</strong>,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Recebemos uma solicitação para excluir sua conta no{" "}
              <strong>Eco Market</strong>. Se você realmente deseja prosseguir
              com a exclusão da sua conta, por favor clique no botão abaixo:
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                href={deleteAccountUrl}
                className="bg-red-600 text-white text-[14px] font-medium py-[12px] px-[24px] rounded no-underline"
              >
                Excluir Minha Conta
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              Se você não solicitou a exclusão da sua conta, por favor ignore
              este e-mail. Sua conta permanecerá ativa.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Atenciosamente,
              <br />
              Equipe Eco Market
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

DeleteAccount.PreviewProps = {
  username: "Jhon Doe",
  deleteAccountUrl: "https://eco-market.com/account/delete?token=abc123",
} as DeleteAccountProps;

export default DeleteAccount;
