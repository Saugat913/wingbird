use std::{io, path::Path};

use crate::{
    api::{ApiClient, CreatePatchRequest},
    config::{Config, Pubspec},
    ui::{info, success, wait},
    utils,
};

const SUPPORTED_ARCHITECTURES: &[&str] = &["arm64-v8a", "armeabi-v7a", "x86_64"];
const APK_PATH: &str = "build/app/outputs/flutter-apk/app-release.apk";

pub async fn run(platform: String, channel: String) -> anyhow::Result<()> {
    let config = Config::load()?;
    let pubspec = Pubspec::load()?;
    let client = ApiClient::from_storage(config.server_url).await?;

    info("Building release APK...");
    utils::run_command("flutter", &["build", "apk", "--release"])?;
    anyhow::ensure!(
        Path::new(APK_PATH).exists(),
        "Local release APK not found"
    );

    wait("Downloading base release APK...");
    let base_apk_path = format!("base_{}_{}.apk", platform, pubspec.version);
    client
        .download_release(&config.app_id, &pubspec.version, &platform, &channel, &base_apk_path)
        .await?;

    let base_archs = utils::detect_architectures(&base_apk_path)?;
    let new_archs = utils::detect_architectures(APK_PATH)?;
    let mut architectures = Vec::new();
    for arch in &base_archs {
        if new_archs.contains(arch) && SUPPORTED_ARCHITECTURES.contains(&arch.as_str()) {
            architectures.push(arch.clone());
        }
    }

    anyhow::ensure!(
        !architectures.is_empty(),
        "No supported common architectures found with libapp.so in both base and new APKs (available base: {:?}, new: {:?})",
        base_apk_path,
        APK_PATH
    );

    let mut created_patches = Vec::new();

    for arch in &architectures {
        info(&format!("Processing architecture: {}", arch));

        let base_so_path = format!("base_{}_{}.so", arch, pubspec.version);
        let new_so_path = format!("new_{}_{}.so", arch, pubspec.version);
        let patch_bin_path = format!("patch_{}_{}.patch", arch, pubspec.version);

        utils::extract_libapp_so(&base_apk_path, arch, &base_so_path)?;
        utils::extract_libapp_so(APK_PATH, arch, &new_so_path)?;

        info(&format!("Generating patch diff for {}...", arch));
        let base_bytes = std::fs::read(&base_so_path)?;
        let new_bytes = std::fs::read(&new_so_path)?;
        let mut patch_bytes = Vec::new();
        qbsdiff::Bsdiff::new(&base_bytes, &new_bytes).compare(io::Cursor::new(&mut patch_bytes))?;
        std::fs::write(&patch_bin_path, &patch_bytes)?;

        let file_hash = blake3::hash(&patch_bytes).to_hex().to_string();
        let file_type = "application/octet-stream".to_string();

        wait(&format!("Uploading patch for {}...", arch));
        let (upload_id, _url) = client
            .upload_file(&patch_bin_path, &file_type, &config.app_id, &file_hash)
            .await?;
        client.mark_upload_complete(&config.app_id, &upload_id).await?;

        wait(&format!("Creating patch record for {}...", arch));
        let patch = client
            .create_patch(
                &config.app_id,
                &pubspec.version,
                &platform,
                &channel,
                &CreatePatchRequest {
                    architecture: arch.to_string(),
                    upload_id,
                },
            )
            .await?;
        created_patches.push(patch);

        let _ = std::fs::remove_file(base_so_path);
        let _ = std::fs::remove_file(new_so_path);
        let _ = std::fs::remove_file(patch_bin_path);
    }

    let _ = std::fs::remove_file(base_apk_path);

    success(&format!(
        "Successfully created {} patch artifact(s) ({} architecture(s))!",
        created_patches.len(),
        architectures.len()
    ));

    Ok(())
}
