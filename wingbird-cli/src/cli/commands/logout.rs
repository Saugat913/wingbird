use crate::{api::ApiClient, storage, ui::success};

pub async fn run(server_url: String) -> anyhow::Result<()> {
    let api_client = ApiClient::from_storage(server_url.clone()).await?;
    api_client.logout().await?;
    storage::delete_token(&server_url)?;
    success("Logged out successfully");
    Ok(())
}