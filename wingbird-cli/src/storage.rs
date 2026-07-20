const SERVICE_NAME:&str="wingbird-cli";
const TOKEN_KEY:&str="auth_token";


pub fn save_token(server:&str,token:&str)->anyhow::Result<()>{
    let username=format!("{}-{}",TOKEN_KEY,server);
    let keyring= keyring::Entry::new(SERVICE_NAME, &username)?;
    keyring.set_password(token)?;
    Ok(())
}

pub fn get_token(server:&str)->anyhow::Result<Option<String>>{
    let username=format!("{}-{}",TOKEN_KEY,server);
    let keyring= keyring::Entry::new(SERVICE_NAME, &username)?;
    let password= keyring.get_password()?;
    Ok(Some(password))
}

pub fn delete_token(server:&str)->anyhow::Result<()>{
    let username=format!("{}-{}",TOKEN_KEY,server);
    let keyring= keyring::Entry::new(SERVICE_NAME, &username)?;
    let _=keyring.delete_credential();
    Ok(())
}