use crate::models::pokemon::{Card, Expantion, Price, Series};
use crate::utils::pokemon_data::{
    card_count, card_search_sql, get_card, get_expansion, get_expansions, get_rarities, get_series,
    get_series_list,
};
use actix_web::{error, get, web, Responder, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::str;
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

/* ---------------------------------------------------------
  EXPANTIONS
--------------------------------------------------------- */

/// Get all expansions
#[get("/pokemon/expansions")]
pub async fn expansions() -> Result<impl Responder> {
    let mut _expansions: Vec<Expantion> = get_expansions(None)?;
    Ok(web::Json(_expansions))
}

/// Get expansion via name
#[get("/pokemon/expansion/{name}")]
pub async fn expantion_by_name(name: web::Path<String>) -> Result<impl Responder> {
    println!("name: {}", name);
    match get_expansion(name.to_string(), None) {
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
        let body = test::read_body(resp).await;
        let body_str = std::str::from_utf8(&body).unwrap();
        //println!("Expansion Response: {}", body_str);
        let results: Vec<Expantion> = serde_json::from_str(body_str).unwrap();
        assert!(results.len() > 0);
    }

    #[actix_web::test]
    async fn expansion_via_name_test() {
        let app = test::init_service(App::new().service(expantion_by_name)).await;
        let req = test::TestRequest::default()
            .uri("/pokemon/expansion/Lost%20Origin")
            .to_request();
        let resp = test::call_service(&app, req).await;
        let body = test::read_body(resp).await;
        let body_str = std::str::from_utf8(&body).unwrap();
        //println!("Response: {}", body_str);
        let results: Expantion = serde_json::from_str(body_str).unwrap();
        assert!(results.name.eq("Lost Origin"));
    }
}

/* ---------------------------------------------------------
  Series
--------------------------------------------------------- */

/// Get series
#[get("/pokemon/series")]
pub async fn series() -> Result<impl Responder> {
    let mut _series: Vec<Series> = get_series_list(None)?;
    Ok(web::Json(_series))
}


/// Get series via name
#[get("/pokemon/series/{name}")]
pub async fn series_by_name(name: web::Path<String>) -> Result<impl Responder> {
    match get_series(name.to_string(), None) {
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

    #[actix_web::test]
    async fn series_via_name_test() {
        let app = test::init_service(App::new().service(series_by_name)).await;
        let req = test::TestRequest::default()
            .insert_header(ContentType::plaintext())
            .uri("/pokemon/series/Sword%20%26%20Shield")
            .to_request();
        let resp = test::call_service(&app, req).await;
        assert!(resp.status().is_success());
        let results: Series = test::read_body_json(resp).await;
        assert!(results.name == "Sword & Shield");
    }
}

/* ---------------------------------------------------------
  Rarities
--------------------------------------------------------- */

/// Get rarities 
#[get("/pokemon/card/rarities")]
pub async fn rarities() -> Result<impl Responder> {
    match get_rarities(None) {
        Ok(rarities) => { Ok(web::Json(rarities))},
        Err(e) => { Err(error::ErrorInternalServerError(e))},
    }
}

#[cfg(test)]
mod rarities_tests {
    use super::*;
    use actix_web::{http::header::ContentType, test, App};
    #[actix_web::test]

    async fn rarities_test() {
        let app = test::init_service(App::new().service(rarities)).await;
        let req = test::TestRequest::default()
            .insert_header(ContentType::plaintext())
            .uri("/pokemon/card/rarities")
            .to_request();
        let resp = test::call_service(&app, req).await;
        let body = test::read_body(resp).await;
        let body_str = std::str::from_utf8(&body).unwrap();
        println!("Rarity Response: {}", body_str);
        let json: Vec<String> = serde_json::from_str(body_str).unwrap();
        assert!(json.len() > 0);
    }
}

/* ---------------------------------------------------------
  Cards
--------------------------------------------------------- */

/// Helper function for searching for cards from the database
pub async fn card_search_helper(
    page: u32,
    search_params: CardSearch,
    db_path: Option<String>,
) -> Result<CardSearchResults, Box<dyn std::error::Error>> {
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

    match card_count(&Some(name_filter.clone()), &search_params.expansions,&search_params.rarities, &db_path)
    {
        Ok(val) => count = val,
        Err(e) => return Err(e),
    }
    let _cards: Vec<Card>;
    let search = card_search_sql(
        page,
        Some(name_filter.clone()),
        search_params.expansions.clone(),
        search_params.rarities.clone(),
        Some(sort),
        db_path.clone());
    match search {
        Ok(val) => _cards = val,
        Err(e) => return Err(e),
    }

    let results = CardSearchResults {
        count: count,
        cards: _cards,
    };
    return Ok(results);
}

/// Get cards
#[get("/pokemon/cards/{page}")]
pub async fn card_search(
    page: web::Path<u32>,
    search_params: web::Query<CardSearch>,
) -> Result<impl Responder> {
    match card_search_helper(*page, search_params.0, None).await {
        Ok(results) => {Ok(web::Json(results))},
        Err(e) => {Err(error::ErrorBadRequest(e))}
    }
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
    match get_card(&_id, None) {
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
