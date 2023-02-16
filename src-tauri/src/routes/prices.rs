use crate::utils::sql_prices_data::get_prices;
use crate::{routes::poke_card::CardSearch, utils::sql_prices_data::get_collection_value};
use actix_web::{get, web, Responder, Result};
use serde::{Deserialize, Serialize};
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
    let response = format!("{{ value: {} }}", value);
    let json_resp = serde_json::from_str(&response)?;
    Ok(web::Json(json_resp))
}
