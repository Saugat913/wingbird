use crate::{
    api::ApiClient, config::Config, ui::{error, info, link, success, wait}, utils,
};

const APK_PATH: &str = "build/app/outputs/flutter-apk/app-release.apk";
const APK_MIME: &str = "application/vnd.android.package-archive";

pub async fn run(platform: String, channel: String) -> anyhow::Result<()> {
    let config = Config::load()?;
    let client = ApiClient::from_storage(config.server_url).await?;

    info("Building release APK...");
    utils::run_command("flutter", &["build", "apk", "--release"])?;
    success("APK built successfully");
    link("Output", APK_PATH);

    if !std::path::Path::new(APK_PATH).exists() {
        anyhow::bail!("Release APK build output not found at '{}'. Ensure 'flutter build apk --release' completed successfully.", APK_PATH);
    }

    let file_size = tokio::fs::metadata(APK_PATH).await?.len();
    let size_mb = file_size as f64 / (1024.0 * 1024.0);
    info(&format!("APK size: {:.1} MB", size_mb));

    info("Computing file hash...");
    let file_bytes = tokio::fs::read(APK_PATH).await?;
    let file_hash = blake3::hash(&file_bytes).to_hex().to_string();

    wait("Requesting upload URL...");
    let (key, _url) = client.upload_file(APK_PATH, APK_MIME, &config.app_id, &file_hash).await?;
    success(&format!("Upload complete (key: {})", key));

    // Mark upload as completed on server
    wait("Finalizing upload...");
    match client.mark_upload_complete(&key).await {
        Ok(()) => success("Upload finalized"),
        Err(e) => {
            error(&format!("Warning: failed to finalize upload: {}", e));
            // Don't fail the whole command — the file is on S3
        }
    }

    info(&format!(
        "Release ready ({}, {})",
        platform, channel
    ));



    // Note this code is check for upload and download system
    // let download_path = format!("downloaded_{platform}.apk");

    // wait("Downloading APK...");
    // client.download_file(&key, &download_path).await?;
    // success("Download complete");

    // info("Verifying integrity...");
    // anyhow::ensure!(
    //     utils::compare_files(APK_PATH, &download_path)?,
    //     "Downloaded file does not match the original"
    // );
    // success("Integrity check passed");

    // info(&format!("Ready to create release ({platform}, {channel})"));


   
    Ok(())
}
