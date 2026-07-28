#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateReleaseRequest {
    pub upload_key: String,
    pub release_version: String,
    pub platform: String,
    pub channel: String,
    pub file_hash: String,
    pub file_name: String,
    pub file_size: u64,
    pub file_type: String,
}



#[derive(Debug, serde::Deserialize)]
pub struct ReleaseResponse {
    pub release: ReleaseData,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReleaseData {
    pub id: String,
    pub app_id: String,
    pub release_version: String,
    pub platform: String,
    pub channel: String,
    pub artifact_key: String,
}