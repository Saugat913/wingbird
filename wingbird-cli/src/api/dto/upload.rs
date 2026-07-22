

#[derive(Debug, serde::Deserialize)]
pub struct UploadResponse {
    pub url: String,
    pub key:String
}


#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UploadRequest {
    pub file_name: String,
    pub file_type: String,
    pub file_size: u64,
}
