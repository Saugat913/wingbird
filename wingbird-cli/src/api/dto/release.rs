#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateReleaseRequest {
    pub upload_key: String,
    pub release_version: String,
    pub platform: String,
    pub channel: String,
}
