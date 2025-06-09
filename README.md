# Hangout Newtube with Inflearn

[Next.js 15로 완성하는 실전 YouTube 클론 개발](https://www.inflearn.com/course/nextjs15-%EC%8B%A4%EC%A0%84-youtube-%ED%81%B4%EB%A1%A0%EA%B0%9C%EB%B0%9C/dashboard)을 따라한 과정

## How to run it

Install all packages

```bash
# Install Bun
npm install --global bun

# Check Bun version
bun --version

# Install Shadcn Ui
bunx shadcn@latest --version # Check version
bunx shadcn@2.6.0 init
bunx shadcn@2.6.0 add --all # Add components and dependencies to your project
```

## Getting Started

First, run the development server:

```bash
bun run dev
```

## History

### Initiation

1. [Clerk](https://clerk.com/)

    <details>

    > Clerk: 인증 및 사용자 관리 서비스

    ```bash
    # Install
    bun add @clerk/nextjs@6.20.2
    ```

    ```diff
    // .env.local
    + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_UBLISHABLE_KEY
    + CLERK_SECRET_KEY=YOUR_SECRET_KEY
    + NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    + NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    + NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
    + NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
    ```

    [`src/middleware.ts`](./src/middleware.ts):

    ```typescript
    import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

    const isProtectedRoute = createRouteMatcher([
      "/protected(.*)",
    ]);

    export default clerkMiddleware(async (auth, req) => {
      if(isProtectedRoute(req)) await auth.protect();
    });

    export const config = {
      matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
      ],
    };
    ```

    [`src/app/layout.tsx`](./src/app/layout.tsx):

    ```diff
    ...
    return (
    +   <ClerkProvider afterSignOutUrl="/">
    ...
    ...
    +   </ ClerkProvider>
    );
    ...
    ```

    </details>

2. [Drizzle ORM](https://orm.drizzle.team/) with [Neon](https://neon.com/)

    <details>

    > Drizzle ORM: 관계형 및 SQL과 유사한 쿼리 API를 모두 갖춘 유일한 ORM(Object Relational Mapping)
    > Neon: 서버리스 Postgres 플랫폼

    ```bash
    # Install
    bun add drizzle-orm@0.44.2 @neondatabase/serverless@1.0.0 dotenv@16.5.0
    bun add -D drizzle-kit@0.31.1 tsx@4.19.4
    ```

    ```diff
    // .env.local
    ...

    + DATABASE_URL=YOUR_URL
    ```

    [`src/db/index.ts`](./src/db/index.ts):

    ```typescript
    import { drizzle } from "drizzle-orm/neon-http";

    const db = drizzle(process.env.DATABASE_URL!);
    ```

    [`src/db/schema.ts`](./src/db/schema.ts):

    ```typescript
    import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

    export const users = pgTable("users", {
      id: uuid("id").primaryKey().defaultRandom(),
      clerkId: text("clerk_id").unique().notNull(),
      name: text("name").notNull(),
      imageUrl: text("image_url").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull(),
    }, (t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]);
    ```

    [`drizzle.config.ts`](./drizzle.config.ts):

    ```typescript
    import dotenv from "dotenv";
    import { defineConfig } from 'drizzle-kit';

    dotenv.config({path: ".env.local"})

    export default defineConfig({
      out: './drizzle',
      schema: './src/db/schema.ts',
      dialect: 'postgresql',
      dbCredentials: {
        url: process.env.DATABASE_URL!,
      },
    });
    ```

    ```bash
    # Apply changes to the database
    bunx drizzle-kit push

    # Studio
    bunx drizzle-kit studio
    ```

    </details>

3. [ngrok](https://ngrok.com/)

    <details>

    > ngrok: 로컬에서 실행 중인 서버를 인터넷에서 접근 가능한 공용 URL로 안전하게 노출시켜주는 도구

    ```bash
    # Install
    brew install ngrok

    # Add authtoken
    ngrok config add-authtoken YOUR_KEY

    # Check
    ngrok http --url=viper-certain-early.ngrok-free.app 3000
    ```

    > ngrok가 만들어준 url을 이용하여 clerk의 `configure > webhook`에서 연동해준다.
    > 예시: `https://my-url/api/users/webhook`
    > 연동 후 Signing Secret을 .env에 추가

    ```diff
    // .evn.local
    ...
    CLERK_SIGNING_SECRET=YOUR_SIGNING_SECRET
    ```

    </details>

4. [concurrently](https://github.com/open-cli-tools/concurrently)

    <details>

    > concurrently: 여러 개의 명령어를 동시에 실행할 수 있도록 해주는 Npm 패키지

    ```bash
    # Install
    bun add concurrently@9.1.2
    ```

    [`package.json`](./package.json):

    ```diff
    ...

    "scripts": {
    +   "dev:all": "concurrently \"bun run dev:webhook\" \"bun run dev\"",
    +   "dev:webhook": "ngrok http --url=viper-certain-early.ngrok-free.app 3000",
      ...
    }

    ...
    ```

    </details>

5. [svix](https://www.svix.com/)

    <details>

    > svix: 웹훅 서비스로, 웹훅 전송을 서비스로 제공하여 쉽고 안정적으로 웹훅을 전송할 수 있도록 함

    ```bash
    # Install
    bun add svix@1.66.0
    ```

    [`route.ts`](./src/app/api/users/webhook/route.ts) 에서 clerk signing Secret을 이용하여 웹훅을 연결

    </details>

6. [tRPC](https://trpc.io/)

    <details>

    > tRPC(TypeScript Remote Procedure Call):
    > - TypeScript 기반의 원격 프로시저 호출(RPC) 프레임워크
    > - 클라이언트와 서버 간의 통신을 간편하고 타입 안전하게 만들어주며, 서버에 정의된 함수(프로시저)를 클라이언트에서 마치 로컬 함수처럼 호출할 수 있도록 함

    ```bash
    # Install
    bun add @trpc/server@11.0.0 @trpc/client@11.0.0 @trpc/react-query@11.0.0 @tanstack/react-query@5.80.6 zod client-only server-only
    ```

    [Set up with React Server Compoents](https://trpc.io/docs/client/react/server-components)

    [`src/trpc/init.ts`](./src/trpc/init.ts):

    ```typescript
    import { initTRPC } from '@trpc/server';
    import { cache } from 'react';
    export const createTRPCContext = cache(async () => {
      /**
      * @see: https://trpc.io/docs/server/context
      */
      return { userId: 'user_123' };
    });
    // Avoid exporting the entire t-object
    // since it's not very descriptive.
    // For instance, the use of a t variable
    // is common in i18n libraries.
    const t = initTRPC.create({
      /**
      * @see https://trpc.io/docs/server/data-transformers
      */
      // transformer: superjson,
    });
    // Base router and procedure helpers
    export const createTRPCRouter = t.router;
    export const createCallerFactory = t.createCallerFactory;
    export const baseProcedure = t.procedure;
    ```

    [`src/trpc/routers/_app.ts`](./src/trpc/routers/_app.ts):

    ```typescript
    import { z } from 'zod';
    import { baseProcedure, createTRPCRouter } from '../init';

    export const appRouter = createTRPCRouter({
      hello: baseProcedure
        .input(
          z.object({
            text: z.string(),
          }),
        )
        .query((opts) => {
          return {
            greeting: `hello ${opts.input.text}`,
          };
        }),
    });
    export type AppRouter = typeof appRouter;
    ```

    [`src/app/api/trpc/[trpc]/route.ts`](./src/app/api/trpc/[trpc]/route.ts):

    ```typescript
    import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
    import { createTRPCContext } from '@/trpc/init';
    import { appRouter } from '@/trpc/routers/_app';

    const handler = (req: Request) =>
      fetchRequestHandler({
        endpoint: '/api/trpc',
        req,
        router: appRouter,
        createContext: createTRPCContext,
      });

    export { handler as GET, handler as POST };
    ```

    [`src/trpc/query-client.ts`](./src/trpc/query-client.ts):

    ```typescript
    import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';

    export function makeQueryClient() {
      return new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
          },
          dehydrate: {
            shouldDehydrateQuery: (query) =>
              defaultShouldDehydrateQuery(query) ||
              query.state.status === 'pending',
          },
          hydrate: {},
        },
      });
    }
    ```

    [`src/trpc/client.tsx`](./src/trpc/client.tsx):

    ```typescript
    'use client';
    import type { QueryClient } from '@tanstack/react-query';
    import { QueryClientProvider } from '@tanstack/react-query';
    import { httpBatchLink } from '@trpc/client';
    import { createTRPCReact } from '@trpc/react-query';
    import { useState } from 'react';
    import { makeQueryClient } from './query-client';
    import type { AppRouter } from './routers/_app';

    export const trpc = createTRPCReact<AppRouter>();
    let clientQueryClientSingleton: QueryClient;

    function getQueryClient() {
      if (typeof window === 'undefined') {
        return makeQueryClient();
      }
      return (clientQueryClientSingleton ??= makeQueryClient());
    }

    function getUrl() {
      const base = (() => {
        if (typeof window !== 'undefined') return '';
        if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
        return 'http://localhost:3000';
      })();
      return `${base}/api/trpc`;
    }

    export function TRPCProvider(
      props: Readonly<{
        children: React.ReactNode;
      }>,
    ) {
      const queryClient = getQueryClient();
      const [trpcClient] = useState(() =>
        trpc.createClient({
          links: [
            httpBatchLink({
              url: getUrl(),
            }),
          ],
        }),
      );
      return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {props.children}
          </QueryClientProvider>
        </trpc.Provider>
      );
    }
    ```

    [`src/trpc/server.tsx`](./src/trpc/server.tsx):

    ```typescript
    import 'server-only';
    import { createHydrationHelpers } from '@trpc/react-query/rsc';
    import { cache } from 'react';
    import { createCallerFactory, createTRPCContext } from './init';
    import { makeQueryClient } from './query-client';
    import { appRouter } from './routers/_app';

    export const getQueryClient = cache(makeQueryClient);
    const caller = createCallerFactory(appRouter)(createTRPCContext);
    export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>( caller, getQueryClient );
    ```

    [`src/app/(home)/page.tsx`](./src/app/(home)/page.tsx):

    ```diff
    + import { HydrateClient, trpc } from "@/trpc/server"
    + import PageClient from "./client"
    + import { Suspense } from "react"

    export default async function Home() {
    +   void trpc.hello.prefetch({ text: "chloe" })

    return(
    +     <HydrateClient>
    +       <Suspense fallback={<p>Loading...</p>}>
    +          <PageClient />
    +       </Suspense>
    +     </HydrateClient>
    )
    ```

    [`src/app/(home)/client.tsx`](./src/app/(home)/client.tsx):

    ```typescript
    "use client";

    import { trpc } from "@/trpc/client";

    export default function PageClient() {
      const [ data ] = trpc.hello.useSuspenseQuery({
        text: "chloe",
      })
      return (
        <div>Page client says: { data.greeting }</div>
      )
    }
    ```

    </details>

7. [react-error-boundary](https://www.npmjs.com/package/react-error-boundary)

    <details>

    > react-error-boundary: React 애플리케이션에서 예외 처리를 간편하고 유연하게 도와주는 오픈소스 라이브러리

    ```bash
    # Install
    bun add react-error-boundary@6.0.0
    ```

    [`src/app/(home)/page.tsx`](./src/app/(home)/page.tsx):

    ```diff
    ...
    + import { ErrorBoundary } from "react-error-boundary";

    export default async function Home() {
    ...

      return(
        <HydrateClient>
          <Suspense fallback={<p>Loading...</p>}>
    +      <ErrorBoundary fallback={<p>Error...</p>}>
              <PageClient />
    +      </ErrorBoundary>
          </Suspense>
        </HydrateClient>
      )
    }
    ```

    </details>

8. [superjson](https://www.npmjs.com/package/superjson)

    <details>

    > superjson:
    > - JavaScript 객체를 안전하게 직렬화(serialize)하고 역직렬화(deserialize)할 수 있게 해주는 라이브러리
    > - JSON.stringify와 JSON.parse가 지원하지 않는 다양한 데이터 타입을 손쉽게 다룰 수 있도록 설계

    ```bash
    # Install
    bun add superjson@2.2.2
    ```

    [`src/trpc/init.ts`](./src/trpc/init.ts):

    ```diff
    ...
    + import superjson from "superjson";

    ...
    ...

    const t = initTRPC.create({
    +   transformer: superjson,
    });
    ...
    ```

    [`src/trpc/query-client.ts`](./src/trpc/query-client.ts):

    ```diff
    ...
    + import superjson from "superjson";

    export function makeQueryClient() {
      return new QueryClient({
        defaultOptions: {
          ...
          dehydrate: {
    +       serializeData: superjson.serialize,
            ...
          },
          hydrate: {
    +       deserializeData: superjson.deserialize,
          },
        },
      });
    }
    ```

    [`src/trpc/client.tsx`](./src/trpc/client.tsx):

    ```diff
    ...
    + import superjson from "superjson";

    ...
    const [trpcClient] = useState(() =>
      trpc.createClient({
        links: [
          httpBatchLink({
    +       transformer: superjson,
            url: getUrl(),
          }),
        ],
      }),
    );
    ...

    ```

    </details>

9. [Upstash Redis](https://www.npmjs.com/package/superjson)

    <details>

    > Upstash Redis:
    > - 서버리스 아키텍처 기반의 클라우드 데이터 플랫폼
    > - 개발자가 인프라 관리 없이 빠르고 효율적으로 데이터 저장과 처리를 할 수 있도록 지원하는 완전 관리형 서비스

    ```bash
    # Install
    bun add @upstash/redis@1.35.0
    bun add @upstash/ratelimit@2.0.5
    ```

    ```diff
    // .env.local
    ...
    + UPSTASH_REDIS_REST_URL="YOUR_UPSTASH_REDIS_REST_URL"
    + UPSTASH_REDIS_REST_TOKEN="YOUR_UPSTASH_REDIS_REST_TOKEN"
    ```

    [`src/lib/redis.ts`](./src/lib/redis.ts):

    ```typescript
    ...
    import { Redis } from "@upstash/redis";

    export const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    ```

    [`src/lib/ratelimit.ts`](./src/lib/ratelimit.ts):

    ```typescript
    ...
    import { Ratelimit } from "@upstash/ratelimit";
    import { redis } from "./redis";

    export const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10s") // 요청 제한 설정
    })
    ```

    [`src/trpc/init.ts`](./src/trpc/init.ts):

    ```diff
    ...
    export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
      ...
    + const { success } = await ratelimit.limit(user.id);

    + if(!success) {
    +    throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
    + }
    ...
    ...
    });
    ```

    </details>
