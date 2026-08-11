use clap::{Parser, Subcommand, ValueEnum};

use crate::{
    cli::commands::{init, login, logout, patch, release, whoami},
    ui::error,
};

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
        #[clap(default_value_t=Channel::Prod)]
        channel: Channel,
    },

    /// Patch the latest version
    Patch {
        platform: Platform,
        #[clap(default_value_t=Channel::Prod)]
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
    Prod,
    Stage,
}

impl std::fmt::Display for Channel {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Channel::Prod => write!(f, "prod"),
            Channel::Stage => write!(f, "stage"),
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

        let result = match cli.commands {
            Command::Login { session } => login::run(session, cli.server_url).await,
            Command::Logout => logout::run(cli.server_url).await,
            Command::Whoami => whoami::run(cli.server_url).await,
            Command::Init => init::run(cli.server_url).await,
            Command::Release { platform, channel } => {
                release::run(platform.to_string(), channel.to_string()).await
            }
            Command::Patch { platform, channel } => {
                patch::run(platform.to_string(), channel.to_string()).await
            }
        };

        match result {
            Ok(()) => Ok(()),
            Err(e) => {
                error(&e.to_string());
                std::process::exit(1);
            }
        }
    }
}
