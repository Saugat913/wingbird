use std::path::Path;

use anyhow::anyhow;
use futures_util::StreamExt;
use reqwest::{ Client, ClientBuilder, Url, header};
use serde::Deserialize;
use tokio::{fs::File, io::AsyncWriteExt};

use crate::{
    api::{CreateAppRequest, CreateAppResponse, UploadResponse, User, WhoamiResponse, upload::UploadRequest}, storage,
};

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

    pub async fn from_storage(server_url: String) -> anyhow::Result<Self> {
        let token = storage::get_token(&server_url).unwrap_or(None);
        let api_client = match token {
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

    pub async fn logout(&self) -> anyhow::Result<()> {
        let response = self
            .client
            .post(self.server_url.join("/api/auth/sign-out")?)
            .header("Content-Type", "application/json")
            .body("{}")
            .bearer_auth(&self.token)
            .send()
            .await?;
        if !response.status().is_success() {
            anyhow::bail!("Logout failed");
        }
        Ok(())
    }

    async fn request_file_upload(
        &self,
        file_name: &str,
        file_type: &str,
        file_size: u64,
    ) -> anyhow::Result<(String, String)> {
        let response = self
            .client
            .post(self.server_url.join("/api/uploads")?)
            .bearer_auth(&self.token)
            .json(&UploadRequest {
                file_name: file_name.into(),
                file_type: file_type.into(),
                file_size,
            })
            .send()
            .await?
            .error_for_status()?;

        let UploadResponse { key, url } = response.json().await?;
        Ok((key, url))
    }

    pub async fn upload_file(
        &self,
        file_path: &str,
        file_type: &str,
    ) -> anyhow::Result<(String, String)> {
        let file = File::open(file_path).await?;
        let file_size = file.metadata().await?.len();

        let file_name = Path::new(file_path)
            .file_name()
            .and_then(|s| s.to_str())
            .ok_or_else(|| anyhow!("Invalid file name"))?;

        let (key, url) = self
            .request_file_upload(file_name, file_type, file_size)
            .await?;

        self.client
            .put(&url)
            .header(header::CONTENT_TYPE, file_type)
            .header(header::CONTENT_LENGTH, file_size)
            .body(file)
            .send()
            .await?
            .error_for_status()?;

        Ok((key, url))
    }

    pub async fn download_file(&self, file_key: &str, output_path: &str) -> anyhow::Result<()> {
        let response = self
            .client
            .get(self.server_url.join(&format!("/api/uploads/{file_key}"))?)
            .send()
            .await?
            .error_for_status()?;

        let mut output = File::create(output_path).await?;
        let mut stream = response.bytes_stream();

        while let Some(chunk) = stream.next().await {
            output.write_all(&chunk?).await?;
        }

        output.flush().await?;
        Ok(())
    }

    pub async fn create_app(&self, name: &str,) -> anyhow::Result<CreateAppResponse> {
    let response = self.client
        .post(self.server_url.join("/api/apps")?)
        .header("Content-Type", "application/json")
        .json(&CreateAppRequest { name: name.to_string() })
        .bearer_auth(&self.token)
        .send()
        .await?;
    
    Ok(response.error_for_status()?.json::<CreateAppResponse>().await?)
}
}
