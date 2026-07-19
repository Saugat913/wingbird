pub async fn run(platform: String, channel: String) -> anyhow::Result<()> {
    println!("Release {} {}", platform, channel);
    Ok(())
}
