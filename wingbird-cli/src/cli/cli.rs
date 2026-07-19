use clap::{Parser, Subcommand, ValueEnum};

use crate::cli::commands::{init, login, logout, patch, release, whoami};


#[derive(Debug, Parser)]
#[command(
    name = "wingbird",
    version,
    author,
    about = "Code patching for Flutter apps",
    arg_required_else_help = true
)]
pub struct Cli {
    /// Server url to work with
    #[clap(default_value_t=env!("WINGBIRD_SERVER_URL").to_string(),long,global=true)]
    server_url: String,

    #[clap(subcommand)]
    commands: Command,
}

#[derive(Debug, Subcommand)]
enum Command {
    /// Login
    Login {
        #[arg(long)]
        session: Option<String>,
    },

    /// Logout
    Logout,

    /// Who am I
    Whoami,

    /// Initialize the new app
    Init,

    /// Release the new version
    Release {
        platform: Platform,
        #[clap(default_value_t=Channel::Production)]
        channel: Channel,
    },

    /// Patch the latest version
    Patch {
        platform: Platform,
        #[clap(default_value_t=Channel::Production)]
        channel: Channel,
    },
}

#[derive(Debug, Clone, ValueEnum)]
enum Platform {
    Android,
    Ios,
}

#[derive(Debug, Clone, ValueEnum)]
enum Channel {
    Production,
    Staging,
}

impl std::fmt::Display for Channel {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Channel::Production => write!(f, "production"),
            Channel::Staging => write!(f, "staging"),
        }
    }
}

impl std::fmt::Display for Platform {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Platform::Android => write!(f, "android"),
            Platform::Ios => write!(f, "ios"),
        }
    }
}

impl Cli {
    pub async fn run() -> anyhow::Result<()> {
        let cli = Cli::parse();

        match cli.commands {
            Command::Login { session } => {
                login::run(session).await?;
            }
            Command::Logout => {
                logout::run().await?;
            }
            Command::Whoami => {
                whoami::run().await?;
            }
            Command::Init => {
                init::run().await?;
            }
            Command::Release { platform, channel } => {
                release::run(platform.to_string(), channel.to_string()).await?;
            }
            Command::Patch { platform, channel } => {
                patch::run(platform.to_string(), channel.to_string()).await?;
            }
        }
        Ok(())
    }
}
