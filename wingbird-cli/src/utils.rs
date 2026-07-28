use std::{fs::File, io::Read, path::Path};

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

fn hash_file(path: impl AsRef<Path>) -> anyhow::Result<blake3::Hash> {
    let mut hasher = Hasher::new();
    let mut file = File::open(path)?;
    let mut buffer = [0u8; 8192];

    loop {
        let n = file.read(&mut buffer)?;
        if n == 0 {
            break;
        }
        hasher.update(&buffer[..n]);
    }

    Ok(hasher.finalize())
}

pub fn extract_libapp_so(apk_path: &str, arch: &str, output_path: &str) -> anyhow::Result<()> {
    let file = std::fs::File::open(apk_path)?;
    let mut archive = zip::ZipArchive::new(file)?;
    
    // Flutter libapp.so is typically located at lib/<arch>/libapp.so inside the APK
    let entry_name = format!("lib/{}/libapp.so", arch);
    let mut zip_file = archive.by_name(&entry_name)
        .map_err(|_| anyhow::anyhow!("libapp.so not found in APK for architecture {}", arch))?;

    let mut out_file = std::fs::File::create(output_path)?;
    std::io::copy(&mut zip_file, &mut out_file)?;
    Ok(())
}