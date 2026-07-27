#[derive(Debug, serde::Serialize)]
pub struct CreateReleaseRequest {
    pub upload_key: String,
    pub release_version: String,
    pub platform: String,
    pub channel: String,
    #[serde(rename = "fileHash")]
    pub file_hash: String,
    #[serde(rename = "fileName")]
    pub file_name: String,
    #[serde(rename = "fileSize")]
    pub file_size: u64,
    #[serde(rename = "fileType")]
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
}