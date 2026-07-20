use colored::Colorize;

const BANNER: &str = r#"
 __          ___             _     _         _ 
 \ \        / (_)           | |   (_)       | |
  \ \  /\  / / _ _ __   __ _| |__  _ _ __ __| |
   \ \/  \/ / | | '_ \ / _` | '_ \| | '__/ _` |
    \  /\  /  | | | | | (_| | |_) | | | | (_| |
     \/  \/   |_|_| |_|\__, |_.__/|_|_|  \__,_|
                        __/ |
                       |___|
"#;

pub fn banner() {
    println!("{}", BANNER.cyan().bold());
}

fn print(msg_type: &str, msg: &str, color: fn(&str) -> colored::ColoredString) {
    println!(
        "{} {}",
        color(msg_type).bold(),
        color(msg)
    );
}

pub fn info(msg: &str) {
    print("[➜]", msg, |s| s.cyan());
}

pub fn error(msg: &str) {
    print("[✗]", msg, |s| s.red());
}

pub fn success(msg: &str) {
    print("[✔]", msg, |s| s.green());
}

pub fn wait(msg: &str) {
    print("[⧗]", msg, |s| s.yellow());
}

pub fn step(msg: &str) {
    println!("{} {}", "[✔]".green().bold(), msg.dimmed());
}

pub fn link(msg: &str, url: &str) {
    println!(
        "{} {} {}",
        "[➜]".cyan().bold(),
        msg.dimmed(),
        url.cyan().bold()
    );
}

pub fn profile(name: &str, email: &str, id: &str) {
    let line = "-".repeat(40).dimmed();

    println!("{line}");
    println!("  {} {}", "Name:".bold(), name);
    println!("  {} {}", "Email:".bold(), email);
    println!("  {} {}", "ID:".bold(), id.dimmed());
    println!("{line}");
}