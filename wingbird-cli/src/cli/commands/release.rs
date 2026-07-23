use crate::{
    api::ApiClient, ui::{error, info, link, success, wait}, utils,
};

const APK_PATH: &str = "build/app/outputs/flutter-apk/app-release.apk";
const APK_MIME: &str = "application/vnd.android.package-archive";

pub async fn run(server_url: String, platform: String, channel: String) -> anyhow::Result<()> {
   info("Building release APK...");
    utils::run_command("flutter", &["build", "apk", "--release"])?;
    success("APK built successfully");
    link("Output", APK_PATH);

    let client = ApiClient::from_storage(server_url).await?;

    let file_size = tokio::fs::metadata(APK_PATH).await?.len();
    let size_mb = file_size as f64 / (1024.0 * 1024.0);
    info(&format!("APK size: {:.1} MB", size_mb));

    wait("Requesting upload URL...");
    let (key, _url) = client.upload_file(APK_PATH, APK_MIME).await?;
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
