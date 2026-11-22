# Eco Market

Plataforma digital que conecta produtores locais de alimentos naturais e artesanais a consumidores da mesma região. Projeto do Trabalho de Conclusão de Curso de Engenharia de Software (Unicesumar).

## Estrutura do monorepo

| Pacote | Descrição | Tecnologias |
|---|---|---|
| `apps/api` | API REST, autenticação e regras de negócio | Bun, Elysia, Drizzle ORM, PostgreSQL, Better Auth, React Email, Resend |
| `apps/mobile` | Aplicativo para consumidores e produtores | Expo SDK 58, React Native, Expo Router, React Native Paper, TanStack Query |
| `apps/admin` | Painel administrativo web | React, Vite, Tailwind CSS, shadcn/ui, React Router |
| `packages/shared` | Tipos e schemas de validação compartilhados | TypeScript, Zod |

## Funcionalidades

- **Consumidor:** cadastro e login (com verificação de e-mail), busca de produtores por nome e categoria, página do produtor, detalhes do produto, carrinho, endereços de entrega, checkout com Pix, cartão ou boleto e acompanhamento dos pedidos.
- **Produtor:** dados da loja, cadastro, edição e desativação de produtos, controle de estoque e avanço do status dos pedidos recebidos (pago, em preparo, saiu para entrega, entregue).
- **Administrador:** indicadores da plataforma, gestão de usuários (perfil e bloqueio), moderação de produtos, acompanhamento de pedidos e cadastro de categorias.

## Integrações externas (injeção de dependência)

As integrações ficam atrás de interfaces em `apps/api/src/services` e são escolhidas em `apps/api/src/container.ts`:

- `EmailSender`: usa o **Resend** quando `RESEND_API_KEY` está definida. Sem a chave, o e-mail é impresso no console (útil para obter o link de verificação em desenvolvimento).
- `PaymentGateway`: hoje usa o adaptador `fake`, que aprova o pagamento e gera instruções simuladas de Pix ou boleto. Um gateway real (Stripe, Mercado Pago) pode ser adicionado implementando a mesma interface.
- Login com Google: habilitado somente quando `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão definidos.

## Como executar

Pré-requisitos: [Bun](https://bun.sh) 1.4+, Docker e, para o app, Android Studio (emulador) ou o Expo Go.

```bash
bun install
bun run db:up                       # PostgreSQL 18 via Docker
cp apps/api/.env.example apps/api/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/mobile/.env.example apps/mobile/.env

cd apps/api
bun run db:migrate                  # cria as tabelas
bun run db:seed                     # dados de demonstração
bun run dev                         # http://localhost:3333 (OpenAPI em /docs)
```

Em outros terminais:

```bash
bun run admin:dev                   # http://localhost:5173
bun run mobile:dev                  # Expo (tecla "a" abre o emulador Android)
```

No celular físico, ajuste `EXPO_PUBLIC_API_URL` em `apps/mobile/.env` para o IP da máquina na rede local.

### Usuários de demonstração (senha `ecomarket123`)

| E-mail | Perfil |
|---|---|
| `admin@ecomarket.dev` | Administrador |
| `boaterra@ecomarket.dev` | Produtor |
| `serraverde@ecomarket.dev` | Produtor |
| `maria@ecomarket.dev` | Consumidor |

## Testes e verificação

```bash
cd apps/api && bun test             # regras de checkout e ciclo de vida do pedido
bun run typecheck                   # na raiz: verificação de tipos de todos os pacotes
```
