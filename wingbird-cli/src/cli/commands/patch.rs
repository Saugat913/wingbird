use std::{fs, io, path::Path};

use crate::{
    api::{ApiClient, CreatePatchBatchRequest, CreatePatchRequest},
    config::{Config, Pubspec},
    ui::{info, success, wait},
    utils,
};

const APK_PATH: &str = "build/app/outputs/flutter-apk/app-release.apk";
const PATCH_MIME: &str = "application/octet-stream";
const SUPPORTED_ARCHITECTURES: &[&str] = &["arm64-v8a", "armeabi-v7a", "x86_64"];

pub async fn run(platform: String, channel: String) -> anyhow::Result<()> {
    let config = Config::load()?;
    let version = Pubspec::load()?.version;
    let client = ApiClient::from_storage(config.server_url).await?;

    build_release()?;

    anyhow::ensure!(
        Path::new(APK_PATH).exists(),
        "Release APK not found at '{APK_PATH}'"
    );

    fs::create_dir_all(".wingbird")?;

    wait("Downloading base release APK...");

    let base_apk = format!(".wingbird/base_{platform}_{version}.apk");

    client
        .download_release(&config.app_id, &version, &platform, &channel, &base_apk)
        .await?;

    let base_architectures = utils::detect_architectures(&base_apk)?;
    let new_architectures = utils::detect_architectures(APK_PATH)?;

    let architectures = base_architectures
        .into_iter()
        .filter(|arch| {
            SUPPORTED_ARCHITECTURES.contains(&arch.as_str()) && new_architectures.contains(arch)
        })
        .collect::<Vec<_>>();

    anyhow::ensure!(
        !architectures.is_empty(),
        "No supported common architectures found"
    );

    wait("Building and uploading patches...");

    let mut patches = Vec::with_capacity(architectures.len());

    for arch in &architectures {
        info(&format!("Processing architecture: {arch}"));

        let base_so = format!(".wingbird/base_{arch}_{version}.so");
        let new_so = format!(".wingbird/new_{arch}_{version}.so");
        let patch = format!(".wingbird/patch_{arch}_{version}.patch");

        utils::extract_libapp_so(&base_apk, arch, &base_so)?;
        utils::extract_libapp_so(APK_PATH, arch, &new_so)?;

        let base = fs::read(&base_so)?;
        let new = fs::read(&new_so)?;

        let mut patch_bytes = Vec::new();

        qbsdiff::Bsdiff::new(&base, &new).compare(io::Cursor::new(&mut patch_bytes))?;

        fs::write(&patch, &patch_bytes)?;

        let file_hash = blake3::hash(&patch_bytes).to_hex().to_string();
        let libapp_hash = blake3::hash(&new).to_hex().to_string();

        let (upload_id, _) = client
            .upload_file(&patch, PATCH_MIME, &config.app_id, &file_hash)
            .await?;

        patches.push(CreatePatchRequest {
            architecture: arch.clone(),
            upload_id,
            libapp_hash,
        });

        let _ = fs::remove_file(base_so);
        let _ = fs::remove_file(new_so);
        let _ = fs::remove_file(patch);
    }

    let _ = fs::remove_file(&base_apk);

    wait("Creating patch records...");

    let created = client
        .create_patches(
            &config.app_id,
            &version,
            &platform,
            &channel,
            &CreatePatchBatchRequest { patches },
        )
        .await?;

    success(&format!(
        "Successfully created {} patch artifact(s)!",
        created.len()
    ));

    Ok(())
}

fn build_release() -> anyhow::Result<()> {
    info("Building release APK...");
    utils::run_command("flutter", &["build", "apk", "--release"])
}
