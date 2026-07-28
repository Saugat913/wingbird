use std::{io, path::Path};

use crate::{
    api::{ApiClient, CreatePatchRequest, PatchArtifactDto},
    config::{Config, Pubspec},
    ui::{info, success, wait},
    utils,
};

const ARCHITECTURES: &[&str] = &["arm64-v8a", "armeabi-v7a", "x86_64"];

pub async fn run(platform: String, channel: String) -> anyhow::Result<()> {
    let config = Config::load()?;
    let pubspec = Pubspec::load()?;
    let client = ApiClient::from_storage(config.server_url).await?;

    wait("Looking up base release on server...");
    let releases = client
        .get_releases(&config.app_id, &platform, &channel, &pubspec.version)
        .await?;
    let base_release = releases.first().ok_or_else(|| {
        anyhow::anyhow!(
            "No base release found for version {} ({}, {}). Run 'wingbird release' first.",
            pubspec.version,
            platform,
            channel
        )
    })?;

    info("Building release APK...");
    utils::run_command("flutter", &["build", "apk", "--release"])?;
    let new_apk_path = "build/app/outputs/flutter-apk/app-release.apk";
    anyhow::ensure!(
        Path::new(new_apk_path).exists(),
        "Local release APK not found"
    );

    wait("Downloading base release APK...");
    let base_apk_path = format!("base_{}_{}.apk", platform, pubspec.version);
    client
        .download_file(&base_release.artifact_key, &base_apk_path)
        .await?;

    let mut patch_artifacts = Vec::new();

    // 4. Extract and diff libapp.so for each architecture
    for arch in ARCHITECTURES {
        info(&format!("Processing architecture: {}", arch));

        let base_so_path = format!("base_{}_{}.so", arch, pubspec.version);
        let new_so_path = format!("new_{}_{}.so", arch, pubspec.version);
        let patch_bin_path = format!("patch_{}_{}.patch", arch, pubspec.version);

        // Extract libapp.so from base APK
        utils::extract_libapp_so(&base_apk_path, arch, &base_so_path)?;
        // Extract libapp.so from new APK
        utils::extract_libapp_so(new_apk_path, arch, &new_so_path)?;

        // Generate bsdiff patch using qbsdiff
        info(&format!("Generating patch diff for {}...", arch));
        let base_bytes = std::fs::read(&base_so_path)?;
        let new_bytes = std::fs::read(&new_so_path)?;
        let mut patch_bytes = Vec::new();
        qbsdiff::Bsdiff::new(&base_bytes, &new_bytes).compare(io::Cursor::new(&mut patch_bytes))?;
        std::fs::write(&patch_bin_path, &patch_bytes)?;

        // Compute hash and size
        let file_size = patch_bytes.len() as u64;
        let file_hash = blake3::hash(&patch_bytes).to_hex().to_string();
        let file_name = format!("libapp-{}.patch", arch);
        let file_type = "application/octet-stream".to_string();

        // Upload patch artifact
        wait(&format!("Uploading patch for {}...", arch));
        let (upload_key, _url) = client
            .upload_file(&patch_bin_path, &file_type, &config.app_id, &file_hash)
            .await?;
        client.mark_upload_complete(&upload_key).await?;

        patch_artifacts.push(PatchArtifactDto {
            upload_key,
            architecture: arch.to_string(),
            file_hash,
            file_name,
            file_size,
            file_type,
        });

        // Cleanup temp files
        let _ = std::fs::remove_file(base_so_path);
        let _ = std::fs::remove_file(new_so_path);
        let _ = std::fs::remove_file(patch_bin_path);
    }

    let _ = std::fs::remove_file(base_apk_path);

    // 5. Submit create patch request
    wait("Creating patch record on server...");
    let req = CreatePatchRequest {
        artifacts: patch_artifacts,
    };
    let res = client.create_patch(&base_release.id, &req).await?;

    success(&format!(
        "Successfully created patch #{} with {} architecture artifacts!",
        res.patches.first().map(|p| p.patch_number).unwrap_or(1),
        res.patches.len()
    ));

    Ok(())
}
