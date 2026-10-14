This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Realtime (socket.io)

O sino de notificações usa socket.io através do hook `src/hooks/use-realtime.ts`.
Ele só tenta conectar quando **as duas** variáveis abaixo estão corretas; caso
contrário nenhuma conexão é aberta e o contador do sino não aparece:

- `NEXT_PUBLIC_REALTIME_ENABLED=true`
- `NEXT_PUBLIC_REALTIME_URL` com uma URL `http(s)://` ou `ws(s)://` válida

Como o cookie de sessão `token` é `httpOnly`, o JavaScript não consegue lê-lo.
O hook pede o token a `GET /api/realtime-token`, que exige uma sessão válida,
responde com `Cache-Control: no-store` e devolve 404 quando o realtime está
desligado. O socket é desconectado no logout.

> **Risco:** enquanto o realtime estiver ligado, essa rota entrega ao JavaScript
> o mesmo token que o cookie `httpOnly` protege. Um XSS na aplicação conseguiria
> lê-lo e usá-lo contra a API até ele expirar. Mantenha o realtime desligado
> onde não for usado e, idealmente, faça o backend emitir um token próprio para
> o socket, de vida curta e escopo restrito, em vez de reaproveitar o token de
> sessão.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
