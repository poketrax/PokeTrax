use crate::utils::sql_prices_data::get_prices;
use crate::{routes::poke_card::CardSearch, utils::sql_prices_data::get_collection_value};
use actix_web::{get, web, Responder, Result, error};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use urlencoding;

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize)]
pub struct Price {
    pub date: String,
    pub cardId: String,
    pub variant: String,
    pub rawPrice: f64,
    pub gradedPriceTen: f64,
    pub gradedPriceNine: f64,
}

#[derive(Serialize, Deserialize)]
pub struct PriceSearch {
    pub start: String,
}

#[get("/pokemon/card/price/ebay/{id}")]
pub async fn card_prices_ebay(
    id: web::Path<String>,
    search_params: web::Query<PriceSearch>,
) -> Result<impl Responder> {
    let _id = urlencoding::decode(&id).unwrap();
    let start = urlencoding::decode(&search_params.start).unwrap();
    let prices = get_prices(&_id, &start)?;
    Ok(web::Json(prices))
}

#[get("/pokemon/collection/value")]
pub async fn collection_value(search_params: web::Query<CardSearch>) -> Result<impl Responder> {
    let value = get_collection_value(
        search_params.0.name,
        search_params.0.expansions,
        search_params.0.rarities,
        search_params.0.tags,
    )?;
    let response = format!("{{ \"value\": {} }}", value);
    let json_resp: Value = serde_json::from_str(&response)?;
    Ok(web::Json(json_resp))
}

#[derive(Serialize, Deserialize)]
pub struct TcgpPrice {
    pub price: f64,
    pub date: String,
    pub variant: String,
}

async fn pull_tcgp_data(id: u32) -> Result<Vec<TcgpPrice>, Box<dyn std::error::Error>> {
    let mut prices: Vec<TcgpPrice> = Vec::new();
    let data_url = format!(
        "https://infinite-api.tcgplayer.com/price/history/{}?range=annual",
        id
    );
    let tcgp_res: Value = reqwest::get(data_url).await?.json().await?;

    for tcp_price in tcgp_res["result"].as_array().unwrap() {
        let date = tcp_price["date"].as_str().unwrap();
        for variant in tcp_price["variants"].as_array().unwrap() {
            let price = TcgpPrice {
                variant: String::from(variant["variant"].as_str().unwrap()),
                date: String::from(date),
                price: variant["marketPrice"].as_str().unwrap().parse::<f64>()?,
            };
            prices.push(price);
        }
    }
    Ok(prices)
}

#[get("/tcgp/price/{id}")]
pub async fn tcgp_prices(id: web::Path<u32>) -> Result<web::Json<Vec<TcgpPrice>>, error::Error> {
    match pull_tcgp_data(*id).await {
        Ok(prices) => Ok(web::Json(prices)),
        Err(e) => Err(error::ErrorBadRequest(e))
    }
}
