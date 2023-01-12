use crate::models::pokemon::{Card, Expantion, Price, Series};
use crate::utils::gcp;
use crate::utils::pokemon_data::{
    card_count, card_search_sql, get_card, get_expansion, get_expansions, get_rarities, get_series,
    get_series_list,
};
use crate::utils::shared::in_list;
use actix_web::{error, get, web, Responder, Result};

use serde::{Deserialize, Serialize};
use serde_json::Value;
use urlencoding;

#[derive(Deserialize, Serialize, Clone)]
pub struct CardSearch {
    pub name: Option<String>,
    pub expansions: Option<String>,
    pub rarities: Option<String>,
    pub tags: Option<String>,
    pub sort: Option<String>,
}
#[derive(Deserialize, Serialize)]
pub struct PriceSearch {
    pub variant: Option<String>,
    pub range: Option<String>,
}
#[derive(Deserialize, Serialize)]
pub struct CardSearchResults {
    pub count: i64,
    pub cards: Vec<Card>,
}

/**
 * GET expansions
 * Returns a list of expansions
 */
#[get("/pokemon/expansions")]
pub async fn expansions() -> Result<impl Responder> {
    let mut _expansions: Vec<Expantion> = get_expansions(None).await?;
    Ok(web::Json(_expansions))
}

#[get("/pokemon/expansion/{name}")]
pub async fn expantion_by_name(name: web::Path<String>) -> Result<impl Responder> {
    match get_expansion(name.to_string(), None).await {
        Ok(data) => Ok(web::Json(data)),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

#[cfg(test)]
mod expansion_tests {
    use super::*;
    use actix_web::{http::header::ContentType, test, App};
    #[actix_web::test]
    async fn expansion_test() {
        let app = test::init_service(App::new().service(expansions)).await;
        let req = test::TestRequest::default()
            .insert_header(ContentType::plaintext())
            .uri("/pokemon/expansions")
            .to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
        let results: Vec<Expantion> = test::read_body_json(resp).await;
        assert!(results.len() > 0);
    }
}

/**
 * GET series
 * returns a list of series
 */
#[get("/pokemon/series")]
pub async fn series() -> Result<impl Responder> {
    let mut _series: Vec<Series> = get_series_list(None).await.unwrap();
    Ok(web::Json(_series))
}

#[get("/pokemon/series/{name}")]
pub async fn series_by_name(name: web::Path<String>) -> Result<impl Responder> {
    match get_series(name.to_string(), None).await {
        Ok(data) => Ok(web::Json(data)),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}
#[cfg(test)]
mod series_tests {
    use super::*;
    use actix_web::{http::header::ContentType, test, App};
    #[actix_web::test]
    async fn series_test() {
        let app = test::init_service(App::new().service(series)).await;
        let req = test::TestRequest::default()
            .insert_header(ContentType::plaintext())
            .uri("/pokemon/series")
            .to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
        let results: Vec<Series> = test::read_body_json(resp).await;
        assert!(results.len() > 0);
    }
}

/**
 * GET card Rarities
 */
#[get("/pokemon/card/rarities")]
pub async fn rarities() -> Result<impl Responder> {
    let rarities = get_rarities(None).await.unwrap();
    Ok(web::Json(rarities))
}

#[cfg(test)]
mod rarities_tests {
    use super::*;
    use actix_web::{http::header::ContentType, test, App};
    #[actix_web::test]
    async fn series_test() {
        let app = test::init_service(App::new().service(rarities)).await;
        let req = test::TestRequest::default()
            .insert_header(ContentType::plaintext())
            .uri("/pokemon/card/rarities")
            .to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
        let results: Vec<String> = test::read_body_json(resp).await;
        assert!(results.len() > 0);
    }
}

#[get("/pokemon/cards/{page}")]
pub async fn card_search(
    page: web::Path<u32>,
    search_params: web::Query<CardSearch>,
) -> Result<impl Responder> {
    //Name Filter
    let mut name_filter = urlencoding::decode(search_params.name.as_deref().unwrap_or_default())
        .expect("UTF-8")
        .to_string();
    name_filter = name_filter.replace(" ", "-");
    //Order
    let order = urlencoding::decode(search_params.sort.as_deref().unwrap_or_default())
        .expect("UTF-8")
        .to_string();
    let sort: String;
    if order.eq("name") {
        sort = String::from("ORDER BY name ASC");
    } else if order.eq("setNumber") {
        sort = String::from("ORDER BY expCardNumber ASC");
    } else if order.eq("pokedex") {
        sort = String::from("ORDER BY pokedex ASC");
    } else if order.eq("priceASC") {
        sort = String::from("ORDER BY price ASC");
    } else if order.eq("priceDSC") {
        sort = String::from("ORDER BY price DESC");
    } else if order.eq("dateASC") {
        sort = String::from("ORDER BY datetime(releaseDate) ASC");
    } else if order.eq("dateDSC") {
        sort = String::from("ORDER BY datetime(releaseDate) DESC");
    } else {
        sort = String::from("");
    }

    let count: i64;

    match card_count(
        Some(name_filter.clone()),
        search_params.expansions.clone(),
        search_params.rarities.clone(),
        None
    )
    .await
    {
        Ok(val) => count = val,
        Err(e) => return Err(error::ErrorInternalServerError(e)),
    }

    let _cards: Vec<Card>;
    match card_search_sql(
        *page,
        Some(name_filter.clone()),
        search_params.expansions.clone(),
        search_params.rarities.clone(),
        Some(sort),
        None
    )
    .await
    {
        Ok(val) => _cards = val,
        Err(e) => return Err(error::ErrorInternalServerError(e)),
    }

    let results = CardSearchResults {
        count: count,
        cards: _cards,
    };
    Ok(web::Json(results))
}

#[get("/gcp/pokemon/cards")]
pub async fn card_search_gcp(search_params: web::Query<CardSearch>) -> Result<impl Responder> {
    let _search_params = CardSearch {
        name: search_params.name.clone(),
        expansions: search_params.expansions.clone(),
        rarities: search_params.rarities.clone(),
        tags: None,
        sort: search_params.sort.clone(),
    };
    let results = CardSearchResults {
        count: 0,
        cards: gcp::card_search(_search_params.clone()).await.unwrap(),
    };
    Ok(web::Json(results))
}

#[cfg(test)]
mod card_search_tests {
    use super::*;
    use actix_web::{dev::ServiceResponse, test, App};
    async fn run(url: String) -> ServiceResponse {
        let app = test::init_service(App::new().service(card_search)).await;
        let req = test::TestRequest::default().uri(url.as_str()).to_request();
        return test::call_service(&app, req).await;
    }

    #[actix_web::test]
    async fn search_basic() {
        let resp = run(String::from("/pokemon/cards/0")).await;
        assert!(resp.status().is_success());
        let results: CardSearchResults = test::read_body_json(resp).await;
        assert!(results.count > 15000);
        assert!(results.cards.len() == 25);
    }

    #[actix_web::test]
    async fn search_name() {
        let resp = run(String::from(
            "/pokemon/cards/0?name=Umbreon%20GX%20(Full%20Art)",
        ))
        .await;
        assert!(resp.status().is_success());
        let results: CardSearchResults = test::read_body_json(resp).await;
        assert!(results.count == 1);
    }
}

#[get("/pokemon/card/price/{id}")]
pub async fn card_prices(
    id: web::Path<String>,
    _: web::Query<PriceSearch>,
) -> Result<impl Responder> {
    let _id = urlencoding::decode(id.as_str()).unwrap().to_string();
    match get_card(_id, None).await {
        Ok(card) => {
            let mut prices: Vec<Price> = Vec::new();
            let data_url = format!(
                "https://infinite-api.tcgplayer.com/price/history/{}?range=annual",
                card.idTCGP.clone()
            );
            let tcgp_res: Value = reqwest::get(data_url).await.unwrap().json().await.unwrap();
            for tcp_price in tcgp_res["result"].as_array().unwrap() {
                let date = tcp_price["date"].as_str().unwrap();
                for variant in tcp_price["variants"].as_array().unwrap() {
                    let price = Price {
                        variant: String::from(variant["variant"].as_str().unwrap()),
                        cardId: card.cardId.clone(),
                        date: String::from(date),
                        vendor: String::from("tcgp"),
                        price: variant["marketPrice"]
                            .as_str()
                            .unwrap()
                            .parse::<f64>()
                            .unwrap(),
                    };
                    prices.push(price);
                }
            }
            return Ok(web::Json(prices));
        }
        Err(_) => Err(error::ErrorBadRequest("Card not found")),
    }
}
