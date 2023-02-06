extern crate directories;
use directories::ProjectDirs;
use futures_util::StreamExt;
use log::debug;
use regex::Regex;
use std::{fs::File, io::Write, path::Path};

/// Retieves the absolute path of the data dir based on OS.
pub fn get_data_dir() -> String {
    let dir_option = ProjectDirs::from("com", "github", "poketrax");
    match std::env::var("PK_DATA_DIR") {
        Ok(val) => return String::from(val),
        Err(_) => (),
    }
    if dir_option.is_none() {
        return String::from("./data");
    }
    let project_dirs = dir_option.unwrap();
    let dir_path = project_dirs.config_dir();
    let path = String::from(dir_path.as_os_str().to_str().unwrap());
    debug!("Data Path: {}", path);
    return path;
}

/// File download utility
/// # Arguments
///    * 'url' - url of file to download
///    * 'path' - path and file name to save to
pub async fn download_file(url: &str, path: &str) -> Result<(), String> {
    let client = reqwest::Client::new();
    let res = client
        .get(url)
        .send()
        .await
        .or(Err(format!("Failed to GET from '{}'", &url)))?;
    if res.status() == reqwest::StatusCode::NOT_FOUND {
        return Err(String::from("404 error pulling data"));
    } else {
        let mut file = File::create(path).or(Err(format!("Failed to create file '{}'", path)))?;
        let mut stream = res.bytes_stream();
        while let Some(item) = stream.next().await {
            let chunk = item.or(Err(format!("Error while downloading file")))?;
            file.write_all(&chunk)
                .or(Err(format!("Error while writing to file")))?;
        }
        return Ok(());
    }
}

/// Download static resources from the web
pub async fn get_static_resources() {
    let file_name = format!("{}/pokemon-back.png", get_data_dir());
    let card_back_path = Path::new(&file_name);
    if card_back_path.exists() == false {
        download_file(
            "https://raw.githubusercontent.com/poketrax/pokedata/main/images/cards/pokemon-back.png",
            &file_name)
            .await
            .expect("Failed to download Pokemone back")
    }
}

/// SQL util to search for a value in a JSON array value uses json functions
/// # Arguments
///    * col_name - name of the column that is a json list
///    * value - list of values urlencoded json array
pub fn json_list_value(col_name: String, value: Option<String>) -> String {
    if value.is_none() {
        return String::from("");
    } else {
        let _value = value.unwrap();
        log::debug!("json list col: {} value: {}", col_name, _value);
        let decoded = urlencoding::decode(&_value);
        match decoded {
            Ok(val) => {
                let _val = val.trim();
                let mut _values: Result<Vec<String>, serde_json::Error> =
                    serde_json::from_str(_val);
                match _values {
                    Ok(mut values) => {
                        let mut statement = String::from("");
                        if values.len() > 0 {
                            statement = format!(
                                "AND EXISTS (SELECT 1 FROM json_each({}) WHERE value = \'{}\' ",
                                col_name,
                                values.pop().unwrap()
                            );
                            for val in values {
                                statement = format!("{} OR value = \'{}\'", statement, val);
                            }
                            statement = format!("{})", statement);
                        }
                        log::debug!(" json statement : {}", statement);
                        return statement;
                    }
                    Err(e) => {
                        log::debug!(
                            "json_list_value JSON parse decoding failed {}, values: {}",
                            e,
                            _val
                        );
                        return String::from("");
                    }
                }
            }
            Err(e) => {
                log::warn!("Url decoding failed");
                return String::from("");
            }
        }
    }
}

/// SQL util to search for a value in a JSON array value uses chain of equals (DEPRICATED)
/// # Arguments
///    * col_name - name of the column that is a json list
///    * value - list of values urlencoded json array
pub fn in_list(col_name: String, values: &Option<String>) -> String {
    if values.is_none() {
        return String::from("");
    } else {
        let _value = values.to_owned().unwrap();
        let decoded = urlencoding::decode(&_value);
        match decoded {
            Ok(_decode) => {
                let braces = Regex::new(r"(\[|\])").unwrap();
                let filter = braces.replace_all(&_decode.into_owned(), "").to_string();
                return format!("AND {} in ({})", col_name, filter);
            }
            Err(e) => {
                log::warn!("Url decoding failed");
                return String::from("");
            }
        }
    }
}
