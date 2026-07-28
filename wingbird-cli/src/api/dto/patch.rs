use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct CreatePatchRequest {
    pub artifacts: Vec<PatchArtifactDto>,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PatchArtifactDto {
    pub upload_key: String,
    pub architecture: String,
    pub file_hash: String,
    pub file_name: String,
    pub file_size: u64,
    pub file_type: String,
}

#[derive(Debug, Deserialize)]
pub struct PatchResponse {
    pub patches: Vec<PatchData>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatchData {
    pub id: String,
    pub release_id: String,
    pub patch_number: i32,
    pub architecture: String,
    pub file_name: String,
}