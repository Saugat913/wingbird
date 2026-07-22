use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateAppRequest {
    pub name: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateAppResponse {
    pub id: String,
    pub name: String,
}