use crate::routes::prices::Price;
use crate::utils::shared::get_data_dir;
use crate::utils::sql_collection_data::search_card_collection_count;
use lazy_static::lazy_static;
use rusqlite::{named_params, Connection, Result};

use super::sql_collection_data::search_card_collection;

lazy_static! {
    pub static ref PRICES_DB_PATH: String = format!("{}{}", get_data_dir(), "/prices.sql");
}
/// # Get Prices
///    * Get prices for a card given a start date. will pull prices from start to now.
/// # Arguments
///    * card_id - id of the card you want prices from.
///    * start -  inclusive start data filter.
pub fn get_prices(card_id: &str, start: &str) -> Result<Vec<Price>, Box<dyn std::error::Error>> {
    let connection = Connection::open(PRICES_DB_PATH.as_str())?;
    let mut statement = connection.prepare(
        "SELECT date, cardId, variant, rawPrice, gradedPriceTen, gradedPriceNine 
        FROM prices
        WHERE cardId = :card_id 
        AND date(date) >= date(:date) 
        ORDER BY date(date) DESC",
    )?;
    let mut prices: Vec<Price> = Vec::new();
    let _prices = statement.query_map(
        named_params! {":card_id": &card_id, ":date": &start},
        |row| {
            let price = Price {
                date: row.get(0).unwrap(),
                cardId: row.get(1).unwrap(),
                variant: row.get(2).unwrap_or_default(),
                rawPrice: row.get(3).unwrap(),
                gradedPriceTen: row.get(4).unwrap(),
                gradedPriceNine: row.get(5).unwrap(),
            };
            Ok(price)
        },
    )?;
    for price in _prices {
        prices.push(price?)
    }
    Ok(prices)
}
#[cfg(test)]
mod get_prices_tests {
    use super::{get_prices};
    use serde_json::to_string_pretty;
    #[test]
    fn get_prices_test() {
        let result = get_prices("SWSH03-Darkness-Ablaze-Swanna-149", "2020-01-01");
        match result {
            Ok(val) => {
                println!("prices {}", to_string_pretty(&val[0]).unwrap());
                assert!(val.len() > 0)
            }
            Err(_) => {
                assert!(false)
            }
        }
    }
}

/// # Get Lastest Price
///    * Get the latest price of a card given a card_id
/// # Arguments
///    * card_id - id of the card you want prices from.
pub fn get_latest_price(card_id: &str) -> Result<Price, Box<dyn std::error::Error>> {
    let connection = Connection::open(PRICES_DB_PATH.as_str())?;
    let mut statement = connection.prepare(
        "SELECT date, cardId, variant, rawPrice, gradedPriceTen, gradedPriceNine 
        FROM prices
        WHERE cardId = :card_id 
        ORDER BY date(date) DESC 
        LIMIT 1",
    )?;
    let price = statement.query_row(
        named_params! {":card_id": &card_id},
        |row| {
            let price = Price {
                date: row.get(0).unwrap(),
                cardId: row.get(1).unwrap(),
                variant: row.get(2).unwrap_or_default(),
                rawPrice: row.get(3).unwrap(),
                gradedPriceTen: row.get(4).unwrap(),
                gradedPriceNine: row.get(5).unwrap(),
            };
            Ok(price)
        },
    )?;
    Ok(price)
}
#[cfg(test)]
mod get_latest_price_tests {
    use super::{get_latest_price};
    use serde_json::to_string_pretty;
    #[test]
    fn get_prices_test() {
        let result = get_latest_price("SWSH03-Darkness-Ablaze-Swanna-149");
        match result {
            Ok(val) => {
                println!("price {}", to_string_pretty(&val).unwrap());
            }
            Err(_) => {
                assert!(false)
            }
        }
    }
}

/// # Get Collection Value
///    * Get value of all cards in a search 
/// 
pub fn get_collection_value(
    name_filter: Option<String>,
    exp_filter: Option<String>,
    rare_filter: Option<String>,
    tag_filter: Option<String>,
) -> Result<f64, Box<dyn std::error::Error>> {
    let mut value: f64 = 0.0;
    let count = search_card_collection_count(
        name_filter.clone(),
        exp_filter.clone(),
        rare_filter.clone(),
        tag_filter.clone(),
    )?;
    let cards = search_card_collection(
        0,
        name_filter,
        exp_filter,
        rare_filter,
        tag_filter,
        None,
        Some(count),
    )?;

    for card in cards {
        let price = get_latest_price(&card.cardId)?;
        let mut card_val = 0.0;
        if card.grade.is_some() {
            let grade = card.grade.unwrap();
            if grade.contains("10") {card_val += price.gradedPriceTen}
            if grade.contains("9") {card_val += price.gradedPriceNine}
        } 
        if card_val == 0.0 {
            card_val += price.rawPrice;
        }
        value += card_val;
    }
    Ok(value)
}

#[cfg(test)]
mod get_collection_value_tests {
    use super::{get_collection_value};
    use serde_json::to_string_pretty;
    #[test]
    fn get_col_value_test() {
        let result = get_collection_value(
            Some(String::from("SWSH07-Evolving-Skies-Dragonite-V-(Full-Art)-191")),
            None,None, None
        );
        match result {
            Ok(val) => {
                println!("value: {}", to_string_pretty(&val).unwrap());
            }
            Err(_) => {
                assert!(false)
            }
        }
    }
}