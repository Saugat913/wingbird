use crate::{api::ApiClient, config::{Config, Pubspec}, ui::{info, success}};

pub async fn run(server_url: String) -> anyhow::Result<()> {
    if Config::exists() {
        let config = Config::load()?;
        info(&format!("Already initialized: {} ({})", config.app_name, config.app_id));
        return Ok(());
    }

    let pubspec = Pubspec::load()?; 
    info(&format!("Found Flutter project: {} v{}", pubspec.name, pubspec.version.unwrap_or_default()));

    let client = ApiClient::from_storage(server_url.clone()).await?;
    let result = client.create_app(&pubspec.name).await?;
    success(&format!("App created: {} ({})", result.name, result.id));

    Config::save(server_url, result.id, result.name)?;
    success("Initialized wingbird.yaml");

    Ok(())
}