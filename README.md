# Wingbird

<p align="center">
  <img src="wingbird-server/public/logo.svg" alt="Wingbird Logo" width="180">
</p>

<p align="center">
  <b>Instant Code Patching & Hot-Fix Distribution for Flutter Applications</b>
</p>

---

## Overview
Instant binary-diff patching for Flutter apps. Generate a `bsdiff` patch of `libapp.so` with the CLI, serve it from the Wingbird server, and hot-apply it on-device via the SDK — no app store round-trip.

## Components

- **`wingbird-cli`** — Rust dev tool: builds the base release, extracts `libapp.so`, computes patches, uploads them.
- **`wingbird-server`** — Cloudflare Workers + Hono API (D1, S3) with OAuth.
- **`wingbird-sdk`** — Flutter SDK that downloads and hot-swaps patches at runtime.

## Quick Start

```bash
# CLI
cd wingbird-cli
cargo build --release
wingbird init --server-url http://localhost:5173
wingbird login
wingbird release android production
wingbird patch android production

# Server
cd wingbird-server
bun install
cp .dev.vars.example .dev.vars   # fill in values, keep real creds local
bun run dev
```

More: server setup/deploy in `wingbird-server/README.md`, SDK usage in `wingbird-sdk/README.md`.

## License

Apache License 2.0 © 2026 Wingbird Team
