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

2. [Drizzle ORM](https://orm.drizzle.team/) with [Neon](https://neon.com/)

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

3. [ngrok](https://ngrok.com/)

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

4. [concurrently](https://github.com/open-cli-tools/concurrently)

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

5. [svix](https://www.svix.com/)

    > svix: 웹훅 서비스로, 웹훅 전송을 서비스로 제공하여 쉽고 안정적으로 웹훅을 전송할 수 있도록 함

    ```bash
    # Install
    bun add svix@1.66.0
    ```

    [`route.ts`](./src/app/api/users/webhook/route.ts) 에서 clerk signing Secret을 이용하여 웹훅을 연결
