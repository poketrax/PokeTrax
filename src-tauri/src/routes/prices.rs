use serde::{Serialize, Deserialize};
use actix_web::{get, web, Responder, Result};
use urlencoding;
use crate::utils::prices_data::get_prices;

#[allow(non_snake_case)]
#[derive(Serialize)]
#[derive(Deserialize)]
pub struct Price {
    pub date: String,
    pub cardId: String,
    pub variant: String,
    pub rawPrice: f64,
    pub gradedPriceTen: f64,
    pub gradedPriceNine: f64,
}

#[derive(Serialize)]
#[derive(Deserialize)]
pub struct PriceSearch {
    pub start: String
}

#[get("/pokemon/card/price/ebay/{id}")]
pub async fn card_prices_ebay(
    id: web::Path<String>,
    search_params: web::Query<PriceSearch>,
) -> Result<impl Responder> {
    let _id = urlencoding::decode(&id).unwrap();
    let prices = get_prices(&_id, &search_params.start)?;
    Ok(web::Json(prices))
}