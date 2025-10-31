# E-commerce Completo com Next.js

E-commerce moderno construído com Next.js, Express, Prisma e SQLite.

## Estrutura do Projeto

- `client/` - Frontend Next.js com Tailwind CSS
- `server/` - Backend Express com Prisma ORM

## Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Zustand, NextAuth.js
- **Backend**: Express, TypeScript, Prisma ORM, SQLite
- **Pagamento**: Mercado Pago SDK

## Instalação

### Backend

```bash
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
cp .env.example .env
# Configure suas variáveis de ambiente no .env
npm run dev
```

### Frontend

```bash
cd client
npm install
cp .env.example .env.local
# Configure suas variáveis de ambiente no .env.local
npm run dev
```

## Variáveis de Ambiente

### Server (.env)
- `PORT` - Porta do servidor (padrão: 5000)
- `DATABASE_URL` - URL do banco SQLite
- `JWT_SECRET` - Secret para JWT
- `MERCADOPAGO_ACCESS_TOKEN` - Token do Mercado Pago
- `MERCADOPAGO_PUBLIC_KEY` - Chave pública do Mercado Pago

### Client (.env.local)
- `NEXTAUTH_URL` - URL da aplicação
- `NEXTAUTH_SECRET` - Secret do NextAuth
- `API_URL` - URL da API backend

## Scripts

### Server
- `npm run dev` - Inicia servidor em desenvolvimento
- `npm run build` - Compila TypeScript
- `npm run start` - Inicia servidor em produção
- `npm run prisma:studio` - Abre Prisma Studio

### Client
- `npm run dev` - Inicia Next.js em desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Inicia servidor de produção

