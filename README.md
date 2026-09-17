# Wingbird CLI

Wingbird is an open-source code-patching tool for Flutter Android applications. This repository contains the Rust command-line client that builds releases, creates binary patches, and communicates with the Wingbird backend.

> **Status:** Experimental / beta. The core workflow is under active development and is not yet production-ready.

## Responsibilities

- Build Flutter Android release APKs.
- Locate and extract Flutter AOT libraries (`libapp.so`) from APKs.
- Detect supported Android architectures.
- Calculate binary hashes and generate binary patches with `qbsdiff`.
- Upload release and patch artifacts through the Wingbird API.
- Authenticate through a browser-based flow and retain credentials using the system keyring.
- Maintain local working files used during release and patch creation.

## Technology

- Rust 2024 edition
- `clap` for the CLI interface
- `reqwest` for HTTP and multipart requests
- `qbsdiff` for binary patch generation
- `blake3` for hashing
- `tokio` and `axum` for asynchronous/local HTTP functionality
- `keyring` for credential storage
- `zip` for APK/archive handling

## Repository layout

```text
src/
├── api/       API models and client functionality
├── cli/       CLI definition and commands
├── config.rs  Configuration handling
├── server.rs  Local server/authentication support
├── storage.rs Local storage support
├── ui.rs      Terminal/user-interface helpers
└── utils.rs   File, APK, architecture, and hashing utilities
```

## Development

Install Rust and Flutter, then build the CLI:

```bash
cargo build
```

Run the command help:

```bash
cargo run -- --help
```

The release and patch commands expect a Flutter Android project and use Flutter's release APK build output. Review the command help and source configuration before running against a real application.

## Related repositories

- [wingbird-sdk](https://github.com/Saugat913/wingbird-sdk) — Flutter plugin and native patch application layer
- [wingbird-server](https://github.com/Saugat913/wingbird-server) — API, persistence, authentication, and artifact storage
- [wingbird-backup](https://github.com/Saugat913/wingbird-backup) — original consolidated repository

## License

Apache-2.0
