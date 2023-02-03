use crate::routes::prices::Price;
use crate::utils::shared::get_data_dir;
use lazy_static::lazy_static;
use rusqlite::{named_params, Connection, Result};

lazy_static! {
    pub static ref PRICES_DB_PATH: String = format!("{}{}", get_data_dir(), "/prices.sql");
}

pub fn get_prices(card_id: &str, start: &str) -> Result<Vec<Price>, Box<dyn std::error::Error>> {
    let connection = Connection::open(PRICES_DB_PATH.as_str())?;
    let mut statement = connection.prepare(
        "SELECT date, cardId, variant, rawPrice, gradedPriceTen, gradedPriceNine 
        FROM prices
        WHERE cardId = :card_id AND
        date(date) >= date(:date)",
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
mod price_tests {
    use super::{*, get_prices};
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