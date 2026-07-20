use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct User {
    pub id:String,
    pub name: String,
    pub email: String,
    pub image: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct WhoamiResponse {
    pub user: User,
}
