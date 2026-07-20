use crate::api::ApiClient;
use crate::ui::{profile};

pub async fn run(server_url: String) -> anyhow::Result<()> {
    let client = ApiClient::from_storage(server_url).await?;
    let user = client.whoami().await?;
    profile(&user.name, &user.email, &user.id);
    Ok(())
}