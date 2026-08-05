use std::{io, path::Path};

use crate::{
    api::{ApiClient, CreatePatchBatchRequest, CreatePatchRequest},
    config::{Config, Pubspec},
    ui::{info, success, wait},
    utils,
};

const SUPPORTED_ARCHITECTURES: &[&str] = &["arm64-v8a", "armeabi-v7a", "x86_64"];
const APK_PATH: &str = "build/app/outputs/flutter-apk/app-release.apk";
const PATCH_MIME: &str = "application/octet-stream";

pub async fn run(platform: String, channel: String) -> anyhow::Result<()> {
    let config = Config::load()?;
    let pubspec = Pubspec::load()?;
    let client = ApiClient::from_storage(config.server_url).await?;

    build_release_apk()?;
    anyhow::ensure!(
        Path::new(APK_PATH).exists(),
        "Local release APK not found at '{}'. Ensure 'flutter build apk --release' completed successfully.",
        APK_PATH
    );

    wait("Downloading base release APK...");
    let base_apk_path = format!("base_{}_{}.apk", platform, pubspec.version);
    client
        .download_release(&config.app_id, &pubspec.version, &platform, &channel, &base_apk_path)
        .await?;

    let architectures = detect_common_architectures(&base_apk_path)?;

    wait("Building and uploading patches...");
    let patches = generate_and_upload_all(
        &client,
        &base_apk_path,
        &architectures,
        &pubspec.version,
        &config.app_id,
    )
    .await?;

    std::fs::remove_file(&base_apk_path).ok();

    wait("Creating patch records...");
    let req = CreatePatchBatchRequest { patches };
    let created = client
        .create_patches(&config.app_id, &pubspec.version, &platform, &channel, &req)
        .await?;

    success(&format!(
        "Successfully created {} patch artifact(s) ({} architecture(s))!",
        created.len(),
        architectures.len()
    ));

    Ok(())
}

fn build_release_apk() -> anyhow::Result<()> {
    info("Building release APK...");
    utils::run_command("flutter", &["build", "apk", "--release"])
}

fn detect_common_architectures(base_apk_path: &str) -> anyhow::Result<Vec<String>> {
    let base_archs = utils::detect_architectures(base_apk_path)?;
    let new_archs = utils::detect_architectures(APK_PATH)?;

    let architectures: Vec<String> = base_archs
        .iter()
        .filter(|arch| {
            new_archs.contains(arch) && SUPPORTED_ARCHITECTURES.contains(&arch.as_str())
        })
        .cloned()
        .collect();

    anyhow::ensure!(
        !architectures.is_empty(),
        "No supported common architectures found with libapp.so in both base and new APKs \
         (base: {:?}, new: {:?}, supported: {:?})",
        base_archs,
        new_archs,
        SUPPORTED_ARCHITECTURES,
    );

    Ok(architectures)
}

async fn generate_and_upload_all(
    client: &ApiClient,
    base_apk_path: &str,
    architectures: &[String],
    version: &str,
    app_id: &str,
) -> anyhow::Result<Vec<CreatePatchRequest>> {
    let mut patches = Vec::new();
    for arch in architectures {
        info(&format!("Processing architecture: {}", arch));

        let upload_id =
            generate_and_upload_patch(client, base_apk_path, arch, version, app_id).await?;
        patches.push(CreatePatchRequest {
            architecture: arch.clone(),
            upload_id,
        });
    }
    Ok(patches)
}

async fn generate_and_upload_patch(
    client: &ApiClient,
    base_apk_path: &str,
    arch: &str,
    version: &str,
    app_id: &str,
) -> anyhow::Result<String> {
    let (patch_path, file_hash) = generate_patch(base_apk_path, arch, version)?;

    let (upload_id, _) =
        client.upload_file(&patch_path, PATCH_MIME, app_id, &file_hash).await?;

    std::fs::remove_file(&patch_path).ok();
    Ok(upload_id)
}

fn generate_patch(base_apk_path: &str, arch: &str, version: &str) -> anyhow::Result<(String, String)> {
    let base_so_path = format!("base_{}_{}.so", arch, version);
    let new_so_path = format!("new_{}_{}.so", arch, version);
    let patch_path = format!("patch_{}_{}.patch", arch, version);

    info(&format!("Generating patch diff for {}...", arch));

    utils::extract_libapp_so(base_apk_path, arch, &base_so_path)?;
    utils::extract_libapp_so(APK_PATH, arch, &new_so_path)?;

    let base_bytes = std::fs::read(&base_so_path)?;
    let new_bytes = std::fs::read(&new_so_path)?;

    let mut patch_bytes = Vec::new();
    qbsdiff::Bsdiff::new(&base_bytes, &new_bytes)
        .compare(io::Cursor::new(&mut patch_bytes))?;

    std::fs::write(&patch_path, &patch_bytes)?;
    let file_hash = blake3::hash(&patch_bytes).to_hex().to_string();

    let _ = std::fs::remove_file(&base_so_path);
    let _ = std::fs::remove_file(&new_so_path);

    Ok((patch_path, file_hash))
}
