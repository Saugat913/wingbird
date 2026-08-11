# Wingbird Server

Wingbird's backend: release/patch API, OAuth, and a dashboard UI, running on Cloudflare Workers + D1 with S3-compatible storage.

## Local development

```txt
bun install
cp .dev.vars.example .dev.vars   # fill in your values
bun run dev
```

`.dev.vars` / `.prod.vars` are gitignored — keep real credentials local, only commit the `.example` template with placeholders.

## Database (D1)

```txt
bun run db:generate   # generate Drizzle schema
bun run db:migrate    # apply migrations locally
```

## Deploy

```txt
bun run env:push      # push .prod.vars secrets to Cloudflare
bun run deploy
```

## Types & docs

```txt
bun run cf-typegen    # regenerate Cloudflare bindings types
bun run dev
```

The generated OpenAPI spec and interactive docs are available under `/doc` while the dev server runs. Routers bind the Worker bindings via `AppEnv` from `src/env.ts`:

```ts
const app = new OpenAPIHono<AppEnv>()
```
