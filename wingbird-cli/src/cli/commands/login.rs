use webbrowser::open;
use crate::{api::ApiClient, server::Server, storage, ui::{banner, error, info, link, success}};

pub async fn run(session: Option<String>,server_url:String) -> anyhow::Result<()> {
    
    match session {
        Some(token) => {
            let client = ApiClient::new(&token, server_url.parse()?).await?;
            match client.whoami().await {
                Ok(user) => {
                    success(&format!("Login successful. Loginned as {}", user.name));
                    storage::save_token(&server_url, &token)?;
                }
                Err(e) => {
                    return Err(e);
                }
            }
        }
        None => {
            banner();
            info("No session token passed, opening browser for login...");
            let server = Server::new().await?;
            let handler= server.run().await?;
            let local_server_url = format!("http://localhost:{}", handler.get_sock_port());

            let callback_server_url = format!("{}/auth/login?callbackUrl={}", server_url, local_server_url);
            
            link("Click here to login", &callback_server_url);
            open(&callback_server_url)?;
            
            let token = handler.wait_for_token().await?;
            success("Received the token");
        
            let client = ApiClient::new(&token, server_url.parse()?).await?;
            let user = client.whoami().await?;
            success(&format!("Login successful. Loginned as {}", user.name));
            storage::save_token(&server_url, &token)?;
            
        }
    }
    Ok(())
}
