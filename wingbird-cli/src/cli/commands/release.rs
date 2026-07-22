use crate::{
    api::ApiClient,
    ui::{info, link, success, wait},
    utils,
};

const APK_PATH: &str = "build/app/outputs/flutter-apk/app-release.apk";
const APK_MIME: &str = "application/vnd.android.package-archive";

pub async fn run(server_url: String, platform: String, channel: String) -> anyhow::Result<()> {
    info("Building release APK...");
    utils::run_command("flutter", &["build", "apk", "--release"])?;
    success("APK built successfully");
    link("Output", APK_PATH);

    let client = ApiClient::from_storage(server_url).await?;

    wait("Uploading APK...");
    let (_, _) = client.upload_file(APK_PATH, APK_MIME).await?;
    success("Upload complete");

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
