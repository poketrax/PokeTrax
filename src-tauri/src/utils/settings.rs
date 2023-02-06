use lazy_static::lazy_static;
use std::sync::RwLock;

lazy_static! {
    pub static ref ADMIN_DB_FILE: RwLock<String> = RwLock::new(String::new());
    pub static ref ADMIN_MODE: RwLock<bool> = RwLock::new(false);

}

pub struct Settings{
    pub admin: bool,
    pub bgImg: String
}

pub fn get_admin_file_path() -> String {
    return ADMIN_DB_FILE.read().unwrap().clone();
}

pub fn update_admin_file_path(path: String) {
    let mut settings = ADMIN_DB_FILE.write().unwrap();
    *settings = path;
}

pub fn get_admin_mode() -> bool {
    return ADMIN_MODE.read().unwrap().clone();
}

pub fn update_admin_mode(mode: bool) {
    let mut admin_mode = ADMIN_MODE.write().unwrap();
    *admin_mode = mode;
}



#[cfg(test)]
mod admin_file_tests {
    use super::*;
    #[test]
    fn test_admin_right_read() {
        update_admin_file_path(String::from("./test-data/data.sql"));
        let path = get_admin_file_path();
        assert!(
            path == "./test-data/data.sql",
            "Path not updating: {}",
            &path
        )
    }
}

