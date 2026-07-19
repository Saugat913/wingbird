pub async fn run(platform: String, channel: String) -> anyhow::Result<()> {
    println!("Patch {} {}", platform, channel);
    Ok(())
}
