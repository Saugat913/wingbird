use crate::cli::Cli;
mod cli;
mod server;


#[tokio::main]
async fn main()->anyhow::Result<()> {
    Cli::run().await?;
    Ok(())
}
