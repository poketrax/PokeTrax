use crate::utils::shared::get_data_dir;
use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;
use std::sync::RwLock;

lazy_static! {
    pub static ref SETTINGS_FILE: String = format!("{}{}", get_data_dir(), "/settings.json");
    static ref SETTINGS: RwLock<Settings> = RwLock::new(Settings {
        admin: false,
        admin_file: String::from(""),
        bg_img: String::from("assets/backgrounds/coast.jpg")
    });
}
#[derive(Serialize, Deserialize, Clone)]
pub struct Settings {
    pub admin: bool,
    pub admin_file: String,
    pub bg_img: String,
}

pub fn update_settings(update: Settings) {
    let mut settings = SETTINGS.write().unwrap();
    *settings = update;
}

pub fn write_settings(update: &Settings) -> Result<(), Box<dyn std::error::Error>> {
    let json = serde_json::to_string(update)?;
    let mut file = File::create(&*SETTINGS_FILE)?;
    file.write_all(json.as_bytes())?;
    Ok(())
}

pub fn get_settings() -> Settings {
    return SETTINGS.read().unwrap().clone();
}

pub fn read_settings() -> Result<(), Box<dyn std::error::Error>> {
    let path = Path::new(&*SETTINGS_FILE);
    if path.exists() {
        let mut file = File::open(path)?;
        let mut json = String::new();
        file.read_to_string(&mut json)?;
        let saved_settings: Settings = serde_json::from_str(&json)?;
        update_settings(saved_settings);
    } else {
        let default = get_settings();
        write_settings(&default)?;
    }
    Ok(())
}

pub fn get_admin_file_path() -> String {
    return SETTINGS.read().unwrap().admin_file.clone();
}

pub fn update_admin_file_path(path: &str) {
    let mut settings = SETTINGS.write().unwrap();
    settings.admin_file = String::from(path);
}

pub fn get_admin_mode() -> bool {
    return SETTINGS.read().unwrap().admin.clone();
}

pub fn update_admin_mode(mode: bool) {
    let mut settings = SETTINGS.write().unwrap();
    settings.admin = mode;
}

#[cfg(test)]
mod admin_file_tests {
    use super::*;
    #[test]
    fn test_admin_right_read() {
        update_admin_file_path("./test-data/data.sql");
        let path = get_admin_file_path();
        assert!(
            path == "./test-data/data.sql",
            "Path not updating: {}",
            &path
        )
    }
}
