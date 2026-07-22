use crate::cli::Cli;
mod cli;
mod server;
mod api;
mod ui;
mod storage;
mod utils;

#[tokio::main]
async fn main()->anyhow::Result<()> {
    Cli::run().await?;
    Ok(())
}
