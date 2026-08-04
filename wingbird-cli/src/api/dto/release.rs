#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateReleaseRequest {
    pub version: String,
    pub platform: String,
    pub channel: String,
    pub upload_id: String,
}

#[derive(Debug, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReleaseData {
    pub id: String,
    pub version: String,
    pub platform: String,
    pub channel: String,
}
