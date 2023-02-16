use crate::routes::poke_card::CardSearch;
use crate::utils::sql_prices_data::get_prices;
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
    //Selected tags
    let tag_str = search_params.0.tags.unwrap_or_default();
    let _tags: String = urlencoding::decode(&tag_str).unwrap().into();
    //Selected expansions
    let exp_str = search_params.0.expansions.unwrap_or_default();
    let _exps: String = urlencoding::decode(&exp_str).unwrap().into();
    //search term
    let rare_str = search_params.0.rarities.unwrap_or_default();
    let _rares: String = urlencoding::decode(&rare_str).unwrap().into();
    let value = 0;

    
    let response = format!("{{ value: {} }}", value); 
    let json_resp = serde_json::from_str(&response)?;
    Ok(web::Json(json_resp))
}
