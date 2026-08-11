use std::path::Path;

use anyhow::anyhow;
use futures_util::StreamExt;
use reqwest::{Client, ClientBuilder, Url, header};
use tokio::{fs::File, io::AsyncWriteExt};

use crate::{
    api::{
        CreateAppRequest, CreateAppResponse, CreatePatchBatchRequest, CreateReleaseRequest,
        PatchData, ReleaseData, UploadRequest, UploadResponse, User, WhoamiResponse,
    },
    storage,
};

pub struct ApiClient {
    client: Client,
    server_url: Url,
    token: String,
}

impl ApiClient {
    pub async fn new(token: &str, server_url: Url) -> anyhow::Result<Self> {
        let client = ClientBuilder::new()
            .user_agent("wingbird-cli/0.0.1")
            .build()?;

        let api = Self {
            client,
            server_url,
            token: token.to_string(),
        };

        api.whoami().await.map_err(|_| {
            anyhow!("Session expired or invalid. Please login again via 'wingbird login'.")
        })?;

        Ok(api)
    }

    pub async fn from_storage(server_url: String) -> anyhow::Result<Self> {
        let token = match storage::get_token(&server_url)? {
            Some(token) => token,
            None => anyhow::bail!("No token found. Please login again via 'wingbird login'."),
        };
        Ok(Self::new(&token, Url::parse(&server_url)?).await?)
    }

    fn error_message(status: reqwest::StatusCode, body: &str, context: &str) -> String {
        if let Ok(json_val) = serde_json::from_str::<serde_json::Value>(body) {
            if let Some(err_msg) = json_val.get("error").and_then(|v| v.as_str()) {
                return format!("{} ({}): {}", context, status, err_msg);
            }
        }
        format!("{} ({}): {}", context, status, body)
    }

    fn ensure_ok(status: reqwest::StatusCode, body: &str, context: &str) -> anyhow::Result<()> {
        if status.is_success() {
            Ok(())
        } else {
            anyhow::bail!("{}", Self::error_message(status, body, context))
        }
    }

    async fn handle_response<T: serde::de::DeserializeOwned>(
        response: reqwest::Response,
    ) -> anyhow::Result<T> {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        Self::ensure_ok(status, &body, "Request failed")?;
        Ok(serde_json::from_str(&body)?)
    }

    pub async fn whoami(&self) -> anyhow::Result<User> {
        let response = self
            .client
            .get(self.server_url.join("/api/whoami")?)
            .bearer_auth(&self.token)
            .send()
            .await?;
        let whoami: WhoamiResponse = Self::handle_response(response).await?;
        Ok(whoami.user)
    }

    pub async fn logout(&self) -> anyhow::Result<()> {
        let response = self
            .client
            .post(self.server_url.join("/api/auth/sign-out")?)
            .json(&serde_json::json!({}))
            .bearer_auth(&self.token)
            .send()
            .await?;
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        Self::ensure_ok(status, &body, "Logout failed")
    }

    async fn request_file_upload(
        &self,
        file_name: &str,
        file_type: &str,
        file_size: u64,
        app_id: &str,
        file_hash: &str,
    ) -> anyhow::Result<(String, String)> {
        let response = self
            .client
            .post(
                self.server_url
                    .join(&format!("/api/apps/{app_id}/uploads"))?,
            )
            .bearer_auth(&self.token)
            .json(&UploadRequest {
                file_name: file_name.into(),
                file_type: file_type.into(),
                file_size,
                file_hash: file_hash.into(),
            })
            .send()
            .await?;

        let UploadResponse {
            upload_id,
            upload_url,
        } = Self::handle_response(response).await?;
        Ok((upload_id, upload_url))
    }

    pub async fn upload_file(
        &self,
        file_path: &str,
        file_type: &str,
        app_id: &str,
        file_hash: &str,
    ) -> anyhow::Result<(String, String)> {
        let file = File::open(file_path).await?;
        let file_size = file.metadata().await?.len();

        let file_name = Path::new(file_path)
            .file_name()
            .and_then(|s| s.to_str())
            .ok_or_else(|| anyhow!("Invalid file name"))?;

        let (upload_id, upload_url) = self
            .request_file_upload(file_name, file_type, file_size, app_id, file_hash)
            .await?;

        let response = self
            .client
            .put(&upload_url)
            .header(header::CONTENT_TYPE, file_type)
            .header(header::CONTENT_LENGTH, file_size)
            .body(file)
            .send()
            .await?;

        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        Self::ensure_ok(status, &body, "Upload failed")?;

        Ok((upload_id, upload_url))
    }

    pub async fn create_app(&self, name: &str) -> anyhow::Result<CreateAppResponse> {
        let response = self
            .client
            .post(self.server_url.join("/api/apps")?)
            .json(&CreateAppRequest {
                name: name.to_string(),
            })
            .bearer_auth(&self.token)
            .send()
            .await?;

        Self::handle_response(response).await
    }

    pub async fn create_release(
        &self,
        app_id: &str,
        req: &CreateReleaseRequest,
    ) -> anyhow::Result<ReleaseData> {
        let response = self
            .client
            .post(
                self.server_url
                    .join(&format!("/api/apps/{app_id}/releases"))?,
            )
            .bearer_auth(&self.token)
            .json(req)
            .send()
            .await?;

        Self::handle_response(response).await
    }

    pub async fn download_release(
        &self,
        app_id: &str,
        version: &str,
        platform: &str,
        channel: &str,
        output_path: &str,
    ) -> anyhow::Result<()> {
        let encoded_version = urlencoding::encode(version);
        let url = self.server_url.join(&format!(
            "/api/apps/{app_id}/releases/{encoded_version}/download?platform={platform}&channel={channel}"
        ))?;

        let response = self.client.get(url).bearer_auth(&self.token).send().await?;

        let status = response.status();
        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("{}", Self::error_message(status, &body, "Download failed"));
        }

        let mut output = File::create(output_path).await?;
        let mut stream = response.bytes_stream();

        while let Some(chunk) = stream.next().await {
            output.write_all(&chunk?).await?;
        }

        output.flush().await?;
        Ok(())
    }

    pub async fn create_patches(
        &self,
        app_id: &str,
        version: &str,
        platform: &str,
        channel: &str,
        req: &CreatePatchBatchRequest,
    ) -> anyhow::Result<Vec<PatchData>> {
        let encoded_version = urlencoding::encode(version);
        let url = self.server_url.join(&format!(
            "/api/apps/{app_id}/releases/{encoded_version}/patches?platform={platform}&channel={channel}"
        ))?;

        let response = self
            .client
            .post(url)
            .bearer_auth(&self.token)
            .json(req)
            .send()
            .await?;

        Self::handle_response(response).await
    }
}
