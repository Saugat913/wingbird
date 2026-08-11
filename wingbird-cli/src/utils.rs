use std::{fs::File, io::{self}, path::Path};
use blake3::Hasher;


pub fn run_command(app:&str, args:&[&str]) -> anyhow::Result<()> {
    let output = std::process::Command::new(app)
        .args(args)
        .stdout(std::process::Stdio::inherit())
        .stderr(std::process::Stdio::inherit())
        .output()?;
    if !output.status.success() {
        return Err(anyhow::anyhow!("Command failed: {:?}", output.stderr));
    }
    Ok(())
}

// Helper function for verifying the integrity of files
pub fn compare_files(
    a: impl AsRef<Path>,
    b: impl AsRef<Path>,
) -> anyhow::Result<bool> {
    Ok(hash_file(a)? == hash_file(b)?)
}

pub fn hash_file(path: impl AsRef<Path>) -> anyhow::Result<blake3::Hash> {
    let mut hasher = Hasher::new();
    hasher.update_reader(File::open(path)?)?;
    Ok(hasher.finalize())
}


pub fn extract_libapp_so(apk_path: &str, arch: &str, output_path: &str) -> anyhow::Result<()> {
    let file = std::fs::File::open(apk_path)?;
    let mut archive = zip::ZipArchive::new(file)?;

    let entry_name = format!("lib/{}/libapp.so", arch);
    let mut zip_file = archive.by_name(&entry_name)
        .map_err(|_| anyhow::anyhow!("libapp.so not found in APK for architecture {}", arch))?;

    let mut out_file = std::fs::File::create(output_path)?;
    io::copy(&mut zip_file, &mut out_file)?;
    Ok(())
}

pub fn detect_architectures(apk: impl AsRef<Path>) -> anyhow::Result<Vec<String>> {
    let archive = zip::ZipArchive::new(File::open(apk)?)?;

    Ok(archive
        .file_names()
        .filter_map(|name| {
            name.strip_prefix("lib/")
                .and_then(|name| name.strip_suffix("/libapp.so"))
                .map(str::to_owned)
        })
        .collect())
}