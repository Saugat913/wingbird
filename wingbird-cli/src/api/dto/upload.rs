#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UploadResponse {
    pub upload_id: String,
    pub upload_url: String,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UploadRequest {
    pub file_name: String,
    pub file_type: String,
    pub file_size: u64,
    pub file_hash: String,
}
