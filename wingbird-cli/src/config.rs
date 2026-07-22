use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub server_url: String,
    pub app_id: String,
    pub app_name: String,
}

impl Config {
    pub fn exists() -> bool {
        std::path::Path::new("wingbird.yaml").exists()
    }

    pub fn load() -> Result<Self, anyhow::Error> {
        let config = std::fs::read_to_string("wingbird.yaml")?;
        let config: Config = yaml_serde::from_str(&config)?;
        Ok(config)
    }

    pub fn save(server_url: String, app_id: String, app_name: String) -> Result<(), anyhow::Error> {
        let config = Config {
            server_url,
            app_id,
            app_name,
        };
        let config = yaml_serde::to_string(&config)?;
        std::fs::write("wingbird.yaml", config)?;
        Ok(())
    } 
}


#[derive(Debug,Deserialize)]
pub struct Pubspec{
    pub name:String,
    pub version:Option<String>,
    pub description:Option<String>
}


impl Pubspec {
    pub fn load() -> Result<Self, anyhow::Error> {
        let config = std::fs::read_to_string("pubspec.yaml")?;
        let config: Pubspec = yaml_serde::from_str(&config)?;
        Ok(config)
    }
}
