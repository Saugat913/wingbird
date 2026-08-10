# Wingbird

<p align="center">
  <img src="wingbird-server/public/logo.svg" alt="Wingbird Logo" width="180">
</p>

<p align="center">
  <b>Instant Code Patching & Hot-Fix Distribution for Flutter Applications</b>
</p>

---

## Overview

**Wingbird** is an end-to-end binary diff patching platform for Flutter mobile applications. When bugs or critical fixes need to be pushed to production, Wingbird enables you to generate lightweight patch diffs (`bsdiff`) and hot-apply updates directly to user devices in milliseconds—bypassing lengthy app store review cycles.

---

## Architecture

```
┌─────────────────┐       1. Push Base APK        ┌──────────────────┐
│  Wingbird CLI   │ ────────────────────────────> │ Wingbird Server  │
│  (Rust Binary)  │ <──────────────────────────── │ (Hono / D1 / S3) │
└────────┬────────┘       2. Upload Patch         └────────┬─────────┘
         │                                                 │
         │ 3. Generate bsdiff                              │ 4. Fetch Patch
         v                                                 v
  [ libapp.so ]                                    ┌─────────────────┐
                                                   │   Flutter App   │
                                                   └─────────────────┘
```

- **`wingbird-cli`**: Rust-based developer tool for building release binaries, calculating `bsdiff` patches, extracting `libapp.so`, and interacting with the Wingbird API.
- **`wingbird-server`**: Cloudflare Workers + Hono API backed by Cloudflare D1 (SQLite) and S3-compatible Object Storage (Backblaze B2 / R2) with built-in OAuth & dashboard UI.

---

## Quick Start

### 1. Wingbird CLI

#### Installation & Setup

```bash
cd wingbird-cli
cargo build --release
```

#### Initialization & Authentication

Initialize Wingbird in your Flutter project directory:

```bash
wingbird init --server-url http://localhost:5173
wingbird login
```

#### Creating Releases & Patches

```bash
# Push a base release APK
wingbird release android production

# Generate & upload a patch diff against base release
wingbird patch android production
```

---

### 2. Wingbird Server

#### Prerequisites & Setup

```bash
cd wingbird-server
bun install
```

#### Environment Setup & Configuration (`.dev.vars`)

Copy `.dev.vars.example` to create your local `.dev.vars` environment variables file:

```bash
cp .dev.vars.example .dev.vars
```

Fill in your configuration credentials:

```ini
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Better Auth Configuration
BETTER_AUTH_SECRET=your-better-auth-secret-32-chars-or-more
BETTER_AUTH_URL=http://localhost:5173

# S3 / Backblaze B2 Storage Configuration
S3_ACCESS_KEY_ID=your-s3-access-key-id
S3_ACCESS_KEY=your-s3-access-key-secret
S3_BUCKET=wingbird
S3_ENDPOINT=s3.us-east-005.backblazeb2.com
S3_REGION=us-east
S3_PRESIGNED_EXPIRE_SECONDS=900

# Quota & Limits
MAX_RELEASES_PER_APP=3
MAX_PATCHES_PER_RELEASE=3
```

#### Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `GOOGLE_CLIENT_ID` | OAuth Client ID for authentication | — |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | — |
| `BETTER_AUTH_SECRET` | Better Auth secret key | — |
| `BETTER_AUTH_URL` | App Server Base URL | `http://localhost:5173` |
| `S3_ACCESS_KEY_ID` | Storage access key | — |
| `S3_ACCESS_KEY` | Storage secret key | — |
| `S3_BUCKET` | Storage bucket name | `wingbird` |
| `S3_ENDPOINT` | S3 API endpoint | `s3.us-east-005.backblazeb2.com` |
| `S3_REGION` | S3 Region | `us-east` |
| `S3_PRESIGNED_EXPIRE_SECONDS` | Expiration duration for presigned upload URLs | `900` |
| `MAX_RELEASES_PER_APP` | Maximum releases allowed per application | `3` |
| `MAX_PATCHES_PER_RELEASE` | Maximum patches allowed per release | `3` |

#### Running Locally & Deploying

```bash
# Local Development
bun run dev

# Regenerate Cloudflare Bindings Types
bun run cf-typegen

# Deploy Secrets to Production
bun run env:push

# Deploy to Cloudflare Workers
bun run deploy
```

---

## Tech Stack

- **CLI**: Rust, Tokio, Clap, Reqwest, Zip, Blake3, Keyring, Qbsdiff
- **Server**: TypeScript, Hono, OpenAPI, Drizzle ORM, Better Auth, TailwindCSS v4, Vite
- **Infrastructure**: Cloudflare Workers, Cloudflare D1, S3 Storage

---

## License

MIT License © 2026 Wingbird Team