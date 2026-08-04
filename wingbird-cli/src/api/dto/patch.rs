use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePatchRequest {
    pub architecture: String,
    pub upload_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePatchBatchRequest {
    pub patches: Vec<CreatePatchRequest>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PatchData {
    pub id: String,
    pub release_id: String,
    pub patch_number: i32,
    pub architecture: String,
}
