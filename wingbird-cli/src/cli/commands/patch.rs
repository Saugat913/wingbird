use std::{io, path::Path};

use futures_util::future::try_join_all;

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

    wait("Building and uploading patches...");
    let uploads: Vec<(String, String)> = try_join_all(architectures.iter().map(|arch| {
        let client = client.clone();
        let arch = arch.clone();
        let base_apk_path = base_apk_path.clone();
        let version = pubspec.version.clone();
        let app_id = config.app_id.clone();

        async move {
            info(&format!("Processing architecture: {}", arch));

            let base_so_path = format!("base_{}_{}.so", arch, version);
            let new_so_path = format!("new_{}_{}.so", arch, version);
            let patch_bin_path = format!("patch_{}_{}.patch", arch, version);

            let ret_arch = arch.clone();
            let patch_path_for_write = patch_bin_path.clone();
            let file_hash = tokio::task::spawn_blocking(move || {
                utils::extract_libapp_so(&base_apk_path, &arch, &base_so_path)?;
                utils::extract_libapp_so(APK_PATH, &arch, &new_so_path)?;

                info(&format!("Generating patch diff for {}...", arch));
                let base_bytes = std::fs::read(&base_so_path)?;
                let new_bytes = std::fs::read(&new_so_path)?;
                let mut patch_bytes = Vec::new();
                qbsdiff::Bsdiff::new(&base_bytes, &new_bytes)
                    .compare(io::Cursor::new(&mut patch_bytes))?;
                std::fs::write(&patch_path_for_write, &patch_bytes)?;

                let hash = blake3::hash(&patch_bytes).to_hex().to_string();
                let _ = std::fs::remove_file(base_so_path);
                let _ = std::fs::remove_file(new_so_path);
                Ok::<_, anyhow::Error>(hash)
            })
            .await??;

            let (upload_id, _url) = client
                .upload_file(&patch_bin_path, PATCH_MIME, &app_id, &file_hash)
                .await?;

            let _ = std::fs::remove_file(patch_bin_path);

            Ok::<_, anyhow::Error>((ret_arch, upload_id))
        }
    }))
    .await?;

    let _ = std::fs::remove_file(base_apk_path);

    wait("Creating patch records...");
    let req = CreatePatchBatchRequest {
        patches: uploads
            .iter()
            .map(|(architecture, upload_id)| CreatePatchRequest {
                architecture: architecture.clone(),
                upload_id: upload_id.clone(),
            })
            .collect(),
    };
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
