use crate::models::pokemon::{Card, Expantion, SealedProduct, Series};
use crate::utils::shared::{download_file, get_data_dir};
use lazy_static::lazy_static;
use log::info;
use reqwest::header::USER_AGENT;
use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs::File;

use std::path::Path;
use version_compare::Cmp;

use super::shared::in_list;

#[derive(Deserialize, Serialize, Clone)]
pub struct DbStatus {
    ready: bool,
    updated: bool,
    version: String,
    error: String,
}

lazy_static! {
    pub static ref POKE_DB_PATH: String = format!("{}{}", get_data_dir(), "/data.sql");
    static ref POKE_DB_META_PATH: String = format!("{}{}", get_data_dir(), "/meta.json");
}

static GH_POKE_REL_URL: &str = "https://api.github.com/repos/poketrax/pokepull/releases/latest";

fn update_meta_file(ready: bool, updated: bool, version: String, error: String) -> Result<()> {
    let meta_file = std::fs::File::create(POKE_DB_META_PATH.as_str()).unwrap();
    let new_meta = DbStatus {
        updated: updated,
        ready: ready,
        version: version,
        error: error,
    };
    serde_json::to_writer(meta_file, &new_meta).unwrap();
    Ok(())
}

fn read_meta_file() -> Result<DbStatus> {
    let file = File::open(POKE_DB_META_PATH.as_str()).unwrap();
    let mut json_reader = serde_json::Deserializer::from_reader(file);
    let saved_status = DbStatus::deserialize(&mut json_reader).unwrap();
    Ok(saved_status)
}

pub async fn initialize_data() -> Result<DbStatus, Box<dyn std::error::Error>> {
    //search for meta data file
    log::debug!("meta path: {}", POKE_DB_META_PATH.as_str());
    let meta_path = Path::new(POKE_DB_META_PATH.as_str());
    if meta_path.exists() {
        //read meta file
        let saved_status = read_meta_file().unwrap();
        log::debug!("Found data version: {}", saved_status.version);
        //Update to not updated and not loaded.
        update_meta_file(false, false, saved_status.version.clone(), String::new()).unwrap();
        check_poke_data(saved_status.version).await
    } else {
        log::debug!("No Data found pulling database");
        //Create initial file if it doesn't exsist.
        let init_version = String::from("0.0.0");
        update_meta_file(false, false, init_version.clone(), String::new()).unwrap();
        check_poke_data(init_version).await
    }
}

/**
 * Check if the db on github is newer if so download and update metadata file.
 */
async fn check_poke_data(version: String) -> Result<DbStatus, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let gh_rel_latest: Value = client
        .get(GH_POKE_REL_URL)
        .header(USER_AGENT, "PokeTrax")
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    let gh_version_option = gh_rel_latest["name"].as_str();
    if gh_version_option.is_none() {
        return Err(Box::from("Failed to parse name from gh"));
    }
    let mut gh_version = String::from(gh_version_option.unwrap()).to_owned();
    gh_version = gh_version.replace("v", "");
    let not_up_to_date =
        version_compare::compare_to(gh_version.clone(), version.clone(), Cmp::Gt).unwrap();
    info!(
        "Current Version {}, GH Version {}",
        version.clone(),
        gh_version.clone()
    );
    if not_up_to_date {
        info!("Downloading new Data");
        let dl_op = gh_rel_latest["assets"][0]["browser_download_url"].as_str();
        if dl_op.is_none() {
            return Err(Box::from("Failed to parse browser_download_url from gh"));
        }
        let download_url: String = String::from(dl_op.unwrap());
        download_file(&download_url, POKE_DB_PATH.as_str())
            .await
            .unwrap();
        info!("File write complete");
        update_meta_file(true, true, gh_version.clone(), String::new()).unwrap();
        Ok(DbStatus {
            ready: true,
            updated: false,
            version: gh_version.clone(),
            error: String::new(),
        })
    } else {
        info!("Data Already updated!");
        update_meta_file(true, false, version.clone(), String::new()).unwrap();
        Ok(DbStatus {
            ready: true,
            updated: false,
            version: version.clone(),
            error: String::new(),
        })
    }
}

/**
 * Get a single expansion by name
 */
pub async fn get_expansion(name: String) -> Result<Expantion, Box<dyn std::error::Error>> {
    let connection = Connection::open(POKE_DB_PATH.as_str()).unwrap();
    let _name = urlencoding::decode(name.as_str())
        .expect("UTF-8")
        .to_string();
    let statement = format!(
        "SELECT name, series, tcgName, numberOfCards, releaseDate, logoURL, SymbolURL 
        FROM expansions 
        WHERE name = \"{}\"",
        _name);
    let mut query = connection
        .prepare(&statement)?;

    let rows = query
        .query_map([], |row| {
            let exp: Expantion;
            exp = Expantion {
                name: row.get(0)?,
                series: row.get(1)?,
                tcgName: row.get(2)?,
                numberOfCards: row.get(3)?,
                releaseDate: row.get(4)?,
                logoURL: row.get(5)?,
                symbolURL: row.get(6)?,
            };
            Ok(exp)
        })
        .unwrap();
    for row in rows {
        match row {
            Ok(val) => return Ok(val),
            Err(e) => return Err(Box::from(e)),
        }
    }
    Err(Box::from("Expantion not found"))
}

pub async fn get_expansions() -> Result<Vec<Expantion>, Box<dyn std::error::Error>> {
    let connection = Connection::open(POKE_DB_PATH.as_str()).unwrap();
    let mut _expansions: Vec<Expantion> = Vec::new();
    let mut statement = connection
        .prepare("SELECT name, series, tcgName, numberOfCards, releaseDate, logoURL, SymbolURL FROM expansions")?;
    let rows = statement
        .query_map([], |row| {
            let exp: Expantion;
            exp = Expantion {
                name: row.get(0)?,
                series: row.get(1)?,
                tcgName: row.get(2)?,
                numberOfCards: row.get(3)?,
                releaseDate: row.get(4).unwrap_or_default(),
                logoURL: row.get(5)?,
                symbolURL: row.get(6)?,
            };
            Ok(exp)
        })
        .unwrap();
    for row in rows {
        match row {
            Ok(val) => _expansions.push(val),
            Err(e) => return Err(Box::from(e)),
        }
    }
    Ok(_expansions)
}

pub async fn get_series_list() -> Result<Vec<Series>, Box<dyn std::error::Error>> {
    let mut _series: Vec<Series> = Vec::new();
    let connection = Connection::open(POKE_DB_PATH.as_str()).unwrap();
    let mut statement = connection
        .prepare("SELECT name, releaseDate, icon FROM series")
        .unwrap();
    let rows = statement
        .query_map([], |row| {
            Ok(Series {
                name: row.get(0)?,
                releaseDate: row.get(1)?,
                icon: row.get(2)?,
            })
        })
        .unwrap();
    for row in rows {
        match row {
            Ok(val) => _series.push(val),
            Err(e) => return Err(Box::from(e)),
        }
    }
    Ok(_series)
}

pub async fn get_series(name: String) -> Result<Series, Box<dyn std::error::Error>> {
    let connection = Connection::open(POKE_DB_PATH.as_str())?;
    let statement = format!("SELECT name, releaseDate, icon FROM series WHERE name = \"{}\"", name);
    let mut query = connection.prepare(&statement)?;;
    let row = query.query_row([], |row| {
        Ok(Series {
            name: row.get(0)?,
            releaseDate: row.get(1)?,
            icon: row.get(2)?,
        })
    });
    match row {
        Ok(val) => return Ok(val),
        Err(e) => return Err(Box::from(e)),
    }
}

pub async fn get_rarities() -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let mut _rarities: Vec<String> = Vec::new();
    let connection = Connection::open(POKE_DB_PATH.as_str()).unwrap();
    let mut statement = connection
        .prepare("SELECT DISTINCT rarity FROM cards")
        .unwrap();
    let rows = statement.query_map([], |row| Ok(row.get(0)?)).unwrap();
    for row in rows {
        match row {
            Ok(val) => _rarities.push(val),
            Err(e) => return Err(Box::from(e)),
        }
    }
    Ok(_rarities)
}

/**
 * Get the number of cards that match a set of filters
 */
pub async fn card_count(
    name_filter: Option<String>,
    exp_filter: Option<String>,
    rare_filter: Option<String>,
) -> Result<i64, Box<dyn std::error::Error>> {
    let connection = Connection::open(POKE_DB_PATH.as_str()).unwrap();
    let statement = format!(
        "SELECT count(cardId) as cardCount 
        FROM cards 
        WHERE cardId like '%{}%' {} {}",
        &name_filter.unwrap_or_default(),
        in_list(String::from("expName"), exp_filter),
        in_list(String::from("rarity"), rare_filter),
    );
    //Determine count
    let mut query = connection
        .prepare(&statement)?;
    let row = query.query_row([],|row| Ok(row.get(0)),)?;
    match row {
        Ok(val) => return Ok(val),
        Err(e) => return Err(Box::from(e)),
    }
}

/**
 * Search for Cards
 */
pub async fn card_search_sql(
    page: u32,
    name_filter: Option<String>,
    exp_filter: Option<String>,
    rare_filter: Option<String>,
    sort: Option<String>,
) -> Result<Vec<Card>, Box<dyn std::error::Error>> {
    let limit = 25;
    let mut _cards: Vec<Card> = Vec::new();
    let connection = Connection::open(POKE_DB_PATH.as_str())?;

    let statement = format!(
        "SELECT name, cardId, idTCGP, 
        expName, expCardNumber, expCodeTCGP, expIdTCGP,
        rarity, cardType, energyType, variants, 
        pokedex, releaseDate, price, img
        FROM cards 
        WHERE cardId like \"%{}%\"
        {} {} {}
        LIMIT {} OFFSET {}",
        &name_filter.unwrap_or_default(),
        in_list(String::from("expName"), exp_filter),
        in_list(String::from("rarity"), rare_filter),
        &sort.unwrap_or_default(),
        &format!("{}", limit),
        &format!("{}", (page.to_owned() * limit))
    );
    //Query page
    let mut query = connection.prepare(statement.as_str())?;
    let rows = query.query_map([], |row| {
        let variants_str: String = row.get(10).unwrap_or_default();
        let variants: Vec<String> =
            serde_json::from_str(variants_str.as_str()).expect("JSON parsing error");
        Ok(Card {
            name: row.get(0).unwrap_or_default(),
            cardId: row.get(1).unwrap_or_default(),
            idTCGP: row.get(2).unwrap_or_default(),
            expName: row.get(3).unwrap_or_default(),
            expCardNumber: row.get(4).unwrap_or_default(),
            expCodeTCGP: row.get(5).unwrap_or_default(),
            expIdTCGP: row.get(6).unwrap_or_default(),
            rarity: row.get(7).unwrap_or_default(),
            cardType: row.get(8).unwrap_or_default(),
            energyType: row.get(9).unwrap_or_default(),
            variants: variants,
            pokedex: row.get(11).unwrap_or_default(),
            releaseDate: row.get(12).unwrap_or_default(),
            price: row.get(13).unwrap_or_default(),
            img: row.get(14).unwrap_or_default(),
            tags: None,
            variant: None,
            paid: None,
            count: None,
            grade: None,
        })
    })?;
    for row in rows {
        match row {
            Ok(val) => _cards.push(val),
            Err(e) => return Err(Box::from(e)),
        }
    }
    Ok(_cards)
}

pub async fn get_card(name_filter: String) -> Result<Card, Box<dyn std::error::Error>> {
    let cards;
    match card_search_sql(0, Some(name_filter.clone()), None, None, None).await {
        Ok(val) => cards = val,
        Err(e) => return Err(Box::from(e)),
    }
    if cards.len() < 1 {
        Err(Box::from("No Card Found"))
    } else {
        Ok(cards[0].clone())
    }
}

/**
 * Get total of sealed products in a given search
 */
pub async fn product_count(name_filter: Option<String>) -> Result<i64, Box<dyn std::error::Error>> {
    let connection = Connection::open(POKE_DB_PATH.as_str())?;
    let statement = format!(
        "SELECT count(name) as total 
            FROM cards 
            WHERE cardId like \"%{}%\"",
        &name_filter.unwrap_or_default()
    );
    let mut query = connection.prepare(&statement)?;
    //Determine count
    let row = query.query_row([], |row| Ok(row.get(0)))?;
    match row {
        Ok(val) => return Ok(val),
        Err(e) => Err(Box::from(e)),
    }
}

/**
 * Search for sealed products in the sql database
 */
pub async fn product_search_sql(
    page: u32,
    name_filter: Option<String>,
    sort: Option<String>,
) -> Result<Vec<SealedProduct>, Box<dyn std::error::Error>> {
    let limit = 25;
    let limit_str = format!("{}", limit);
    let mut products: Vec<SealedProduct> = Vec::new();
    let connection = Connection::open(POKE_DB_PATH.as_str())?;
    let statement = format!(
        "SELECT name, price, idTCGP, expIdTCGP, expName, type, img
        FROM sealed 
        WHERE name LIKE '%{}%'
        {}
        LIMIT {}
        OFFSET {}",
        &name_filter.unwrap_or_default(),
        &sort.unwrap_or_default(),
        &limit_str,
        &format!("{}", (page.to_owned() * limit)),
    );
    //Query page
    let mut query = connection.prepare(&statement)?;

    let rows = query
        .query_map([], |row| {
            let id_tcgp_row: String = row.get(2).unwrap_or_default();
            let id_tcgp_str = id_tcgp_row.replace(".0", "");
            Ok(SealedProduct {
                name: row.get(0).unwrap_or_default(),
                price: row.get(1).unwrap_or_default(),
                idTCGP: id_tcgp_str.parse::<i64>().unwrap_or_default(),
                expIdTCGP: row.get(3).unwrap_or_default(),
                expName: row.get(4).unwrap_or_default(),
                productType: row.get(5).unwrap_or_default(),
                img: row.get(6).unwrap_or_default(),
                collection: None,
                paid: None,
                count: None,
            })
        })?;
    for row in rows {
        match row {
            Ok(val) => products.push(val),
            Err(e) => return Err(Box::from(e)),
        }
    }
    Ok(products)
}

#[cfg(test)]
mod product_tests {
    use super::*;
    use serde_json::to_string_pretty;

    #[actix_web::test]
    async fn get_product_count() {
        let count = product_count(None).await;
        match count {
            Ok(val) => {
                assert!(val > 0)
            }
            Err(_) => {
                assert!(false)
            }
        }
    }

    #[actix_web::test]
    async fn get_products() {
        let products = product_search_sql(0, None, None).await;
        match products {
            Ok(val) => {
                let msg = to_string_pretty(&val).unwrap();
                print!("{}", msg);
                assert!(val.len() > 0)
            }
            Err(e) => {
                print!("{}", e);
                assert!(false)
            }
        }
    }
}
