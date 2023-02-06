use crate::utils::sql_pokemon_data::POKE_DB_PATH;
use crate::utils::sql_prices_data::PRICES_DB_PATH;
use crate::utils::shared::{download_file, get_data_dir};
use lazy_static::lazy_static;
use log::{info, warn};
use reqwest::header::USER_AGENT;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{fs::File, sync::RwLock};

lazy_static! {
    /// Path for meta data file refelects the current versions of the databases
    static ref META_PATH: String = format!("{}{}", get_data_dir(), "/meta.json");
    /// Status of the databases
    pub static ref DB_STATUS: RwLock<DbStatus> = RwLock::new(DbStatus {
        data_ready: false,
        prices_ready: false,
        meta_version: String::from("0.0.0"),
        data_version: 0,
        price_version: 0,
        msg: String::from("")
    });
}
/// GitHub Release metadata rest endpoint
static GH_POKE_REL_URL: &str = "https://api.github.com/repos/poketrax/pokedata/releases/latest";

/// # DbStatus
///    * This strucutre holds the status of the databases.
/// # Properties
///    * data_ready: True if the card database is available, False if it's updating (ie downloading new copy)
///    * prices_ready: True if the prices database is available.  False if it's updating (ie downloading new copy)
///    * meta_version: This is the version of the meta data file links to the version of the pokedata release numbers.
///      This increaments if prices or data changes
///    * data_version: Version of the card database
///    * price_version: Version of the prices database
///    * msg: This message changes based on what is actively happening during an update process or contains the error that occured.
#[derive(Deserialize, Serialize, Clone)]
pub struct DbStatus {
    data_ready: bool,
    prices_ready: bool,
    meta_version: String,
    data_version: i32,
    price_version: i32,
    msg: String,
}

/// # GithubData
///    * This structure is used to compile the data from github to feed to a decition making function.
/// # Properties
///    * price_url: URL for downloading the latest price database
///    * data_url: URL for dowblaoding the latest card database
///    * meta: Metadata about the databases.
struct GithubData {
    price_url: String,
    data_url: String,
    meta: PokeDataMeta,
}

/// # PokeDataMeta
///    * This stucture maps to the meta.json file in github releases it provides version info for the databases in a release.
/// # Properties
///    * data: Version of the data database
///    * version: Meta data version this increments if data or prices increases.
///    * prices: Version of the prices database
#[derive(Deserialize, Serialize, Clone)]
pub struct PokeDataMeta {
    data: i32,
    version: String,
    prices: i32,
}

/// Returns a clone of the static var might be out of sync. meant to be use to provide a status to the user about progress of updating the database
pub fn read_db_status() -> Result<DbStatus, Box<dyn std::error::Error>> {
    let status = DB_STATUS.read().unwrap().clone();
    Ok(status)
}

/// Update DbStatus
/// # Arguments
///    * msg - set msg if Some for DbStatus
///    * data_version - set data_version if Some for DbStatus
///    * price_version - set price_version if Some for DbStatus
///    * data_ready - set data_ready if Some for DbStatus
///    * price_ready - set price_ready if Some for DbStatus
pub fn update_db_status(
    msg: Option<&str>,
    meta_verion: Option<&str>,
    data_version: Option<i32>,
    price_version: Option<i32>,
    data_ready: Option<bool>,
    price_ready: Option<bool>,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut status = DB_STATUS.write().unwrap();
    if msg.is_some() {
        status.msg = String::from(msg.unwrap());
    }
    if data_version.is_some() {
        status.data_version = data_version.unwrap();
    }
    if price_version.is_some() {
        status.price_version = price_version.unwrap();
    }
    if data_ready.is_some() {
        status.data_ready = data_ready.unwrap();
    }
    if price_ready.is_some() {
        status.prices_ready = price_ready.unwrap();
    }
    if meta_verion.is_some() {
        status.meta_version = String::from(meta_verion.unwrap());
    }
    Ok(())
}

/// Reads the meta data file and binds to static DbStatus var
async fn init_db_status() -> Result<(), Box<dyn std::error::Error>> {
    let read_meta = get_meta_data(None).await;
    match read_meta {
        Ok(meta) => {
            update_db_status(None,Some(&meta.version), Some(meta.data), Some(meta.prices), None, None).unwrap();
        }
        Err(_) => {
            warn!("Meta Data format failed reinitializting");
            return Ok(());
        }
    }
    Ok(())
}

/// Check if the db on github is newer if so download and update metadata file.
pub async fn check_for_updates() -> Result<(), Box<dyn std::error::Error>> {
    info!("Checking for updates...");
    init_db_status().await?;
    let gh_data = github_asset_meta_data().await?;
    let db_status = read_db_status()?;
    info!("Got Meta Data analyzing ...");
    info!("Checking poke database ...");
    if db_status.data_version < gh_data.meta.data {
        update_db_status(
            Some("Updating Pokemon Card Data ..."),
            None,
            None,
            None,
            None,
            None,
        )?;
        download_file(&gh_data.data_url, &POKE_DB_PATH).await?;
        update_db_status(None, None, Some(gh_data.meta.data), None, Some(true), None)?;
        info!("Updating poke database ...")
    }
    info!("Checking Price database ...");
    if db_status.price_version < gh_data.meta.prices {
        update_db_status(Some("Updating Prices Data ..."), None, None, None, None, Some(true))?;
        download_file(&gh_data.price_url, &PRICES_DB_PATH).await?;
        info!("Updating Price database ...")
    }
    update_db_status(Some("Ready"), None, None, None, Some(true), Some(true))?;
    info!("Update Complete!");
    Ok(())
}

/// Pulls data from Github and organizes all the data to decide what databases to download.
async fn github_asset_meta_data() -> Result<GithubData, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let gh_rel_latest: Value = client
        .get(GH_POKE_REL_URL)
        .header(USER_AGENT, "PokeTrax")
        .send()
        .await?
        .json()
        .await?;
    let mut opt_data_url: Option<String> = None;
    let mut opt_price_url: Option<String> = None;
    let mut opt_meta_url: Option<String> = None;
    let assets = gh_rel_latest["assets"].as_array();
    if assets.is_none() {
        return Err(Box::from("Failed to parse Github assets"));
    }
    for asset in assets.unwrap() {
        //pull values
        let opt_name = asset["name"].as_str();
        let opt_url = asset["browser_download_url"].as_str();
        //check for errors
        if opt_name.is_none() || opt_url.is_none() {
            return Err(Box::from("Failed to parse assest name or URL"));
        }
        let name = opt_name.unwrap();
        let url = opt_url.unwrap();
        //Map Values
        if name.eq("prices.sqlite") {
            opt_price_url = Some(String::from(url));
        }
        if name.eq("meta.json") {
            opt_meta_url = Some(String::from(url));
        }
        if name.eq("data.sqlite") {
            opt_data_url = Some(String::from(url));
        }
    }
    if opt_meta_url.is_none() || opt_data_url.is_none() || opt_price_url.is_none() {
        return Err(Box::from("Failed to get the meta data urls from assests"));
    }
    let meta_url = opt_meta_url.unwrap();
    let gh_data = GithubData {
        data_url: opt_data_url.unwrap(),
        price_url: opt_price_url.unwrap(),
        meta: get_meta_data(Some(&meta_url)).await?,
    };
    Ok(gh_data)
}

/// # Arugments
///    * url - this will download the file at this url and then return the resulting PokeDataMeta or it will pull ./meta.json
async fn get_meta_data(url: Option<&str>) -> Result<PokeDataMeta, Box<dyn std::error::Error>> {
    if url.is_some() {
        download_file(url.unwrap(), META_PATH.as_str()).await?;
    }
    let file = File::open(META_PATH.as_str())?;
    let mut json_reader = serde_json::Deserializer::from_reader(file);
    Ok(PokeDataMeta::deserialize(&mut json_reader)?)
}

