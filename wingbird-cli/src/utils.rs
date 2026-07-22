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