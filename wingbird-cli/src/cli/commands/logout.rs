use crate::{storage, ui::success};

pub async fn run(server_url: String) -> anyhow::Result<()> {
    storage::delete_token(&server_url)?;
    success("Logged out successfully");
    Ok(())
}