This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Primeiros passos

O gerenciador de pacotes é o **yarn** (v1).

```bash
cp .env.example .env.local
yarn install
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Script           | O que faz                          |
| ---------------- | ---------------------------------- |
| `yarn dev`       | servidor de desenvolvimento        |
| `yarn build`     | build de produção                  |
| `yarn start`     | serve o build de produção          |
| `yarn lint`      | ESLint (`next lint`)               |
| `yarn typecheck` | `tsc --noEmit`                     |
| `yarn test`      | testes unitários (`vitest run`)    |

## Variáveis de ambiente

Veja `.env.example`.

| Variável                       | Onde é lida | Descrição |
| ------------------------------ | ----------- | --------- |
| `API_URL`                      | servidor    | URL do backend usada pelo BFF (`src/lib/server/api-client.ts`). Obrigatória em produção; em desenvolvimento cai para `http://localhost:3333/`. |
| `SIGNUP_DEFAULT_ROLE`          | servidor    | Papel das contas criadas em `/register` (padrão `admin`). O navegador não escolhe o papel. |
| `NEXT_PUBLIC_REALTIME_ENABLED` | navegador   | `true` para ligar as notificações em tempo real. |
| `NEXT_PUBLIC_REALTIME_URL`     | navegador   | URL do servidor socket.io. |

> `NEXT_PUBLIC_API_URL` não é mais usada: renomeie para `API_URL`.

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
