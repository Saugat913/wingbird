use crate::cli::Cli;
mod api;
mod cli;
mod config;
mod server;
mod storage;
mod ui;
mod utils;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    Cli::run().await?;
    Ok(())
}
