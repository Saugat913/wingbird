const SERVICE_NAME: &str = "wingbird-cli";
const TOKEN_KEY: &str = "auth_token";

fn entry(server: &str) -> anyhow::Result<keyring::Entry> {
    Ok(keyring::Entry::new(
        SERVICE_NAME,
        &format!("{}-{}", TOKEN_KEY, server),
    )?)
}

pub fn save_token(server: &str, token: &str) -> anyhow::Result<()> {
    entry(server)?.set_password(token)?;
    Ok(())
}

pub fn get_token(server: &str) -> anyhow::Result<Option<String>> {
    match entry(server)?.get_password() {
        Ok(password) => Ok(Some(password)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.into()),
    }
}

pub fn delete_token(server: &str) -> anyhow::Result<()> {
    let _ = entry(server)?.delete_credential();
    Ok(())
}
