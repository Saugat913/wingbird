use crate::cli::Cli;
mod cli;
mod server;
mod api;
mod ui;
mod storage;


#[tokio::main]
async fn main()->anyhow::Result<()> {
    Cli::run().await?;
    Ok(())
}
