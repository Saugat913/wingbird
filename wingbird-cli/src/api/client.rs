use reqwest::{Client, ClientBuilder, Url};
use serde::Deserialize;

use crate::{api::{User, WhoamiResponse}, storage};

pub struct ApiClient {
    client: Client,
    server_url: Url,
    token: String,
}

#[derive(Deserialize)]
struct TokenResponse {
    token: String,
}

impl ApiClient {
    pub async fn new(token: &str, server_url: Url) -> anyhow::Result<Self> {
        let client = ClientBuilder::new()
            .user_agent("wingbird-cli/0.0.1")
            .build()?;

        let resp = client
            .get(server_url.join("/api/auth/token")?)
            .bearer_auth(&token)
            .send()
            .await?;

        if !resp.status().is_success() {
            anyhow::bail!("Session expired or invalid. Please login again via 'wingbird login'.");
        }
        
        let token_response = resp.json::<TokenResponse>().await?;

        Ok(Self {
            client,
            server_url,
            token: token_response.token,
        })
    }

    pub async fn from_storage(server_url: String)->anyhow::Result<Self>{
        let token = storage::get_token(&server_url).unwrap_or(None);
        let api_client =match token {
            Some(token) => Self::new(&token, Url::parse(&server_url)?).await,
            None => anyhow::bail!("No token found. Please login again via 'wingbird login'."),
        }?;
        Ok(api_client)
    }
    pub fn server_url(&self) -> &str {
        &self.server_url.as_str()
    }

    pub async fn whoami(&self) -> anyhow::Result<User> {
        let response = self
            .client
            .get(self.server_url.join("/api/whoami")?)
            .bearer_auth(&self.token)
            .send()
            .await?;
        let response = response.json::<WhoamiResponse>().await?;
        Ok(response.user)
    }
}
