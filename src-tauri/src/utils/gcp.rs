use crate::models::pokemon::Card;
use crate::routes::auth::{get_access_token, service_login};
use crate::routes::poke_card::CardSearch;
use crate::utils::shared::{gcp_ary_to_string_ary, string_ary_to_gcp_ary};
use crate::Cli;

use indicatif::ProgressBar;
use reqwest::{self};
use serde_json::{json, Value};
use std::fs::File;
use std::io::BufReader;

static DATA_STORE_BASE: &str =
    "https://firestore.googleapis.com/v1/projects/alpine-air-331321/databases/(default)/documents";
static LIMIT: u32 = 100;


fn format_array(strs: Vec<String>) -> Vec<Value> {
    let mut str_ary: Vec<Value> = Vec::new();
    for s in strs {
        str_ary.push(json!({ "stringValue": s }))
    }
    return str_ary;
}

pub async fn upsert_card(card: Card) -> Result<(), Box<dyn std::error::Error>> {
    let url = format!("{}/{}/{}", DATA_STORE_BASE, "cards", card.cardId);
    let access_token = get_access_token();
    let id_token = format!("{} {}", "Bearer", access_token);
    let body: Value = json!({
        "fields" : {
            "cardId" : {"stringValue": card.cardId},
            "idTCGP" : {"integerValue": card.idTCGP},
            "name" : {"stringValue": card.name},
            "expCodeTCGP" : {"stringValue": card.expCodeTCGP},
            "expName" : {"stringValue": card.expName},
            "expCardNumber" : {"stringValue": card.expCardNumber},
            "rarity" : {"stringValue": card.rarity},
            "variants" : {"arrayValue": {"values": format_array(card.variants)}},
            "price": {"doubleValue": card.price},
            "pokedex": {"integerValue": card.pokedex},
            "releaseDate": {"timestampValue": card.releaseDate},
            "energyType" : {"stringValue": card.energyType},
            "cardType" : {"stringValue": card.cardType},
            "img" : {"stringValue": card.img}
        }
    });
    log::debug!("request: {}", body.to_string());
    let client = reqwest::Client::new();
    let resp = client
        .patch(url)
        //.query(&[("documentId", card.cardId.as_str())])
        .header("Authorization", id_token.as_str())
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .unwrap();
    let status = resp.status();
    log::debug!(
        "Upsert Card Response: {}\n{}",
        status,
        resp.text().await.unwrap()
    );
    if status.is_success() {
        Ok(())
    } else {
        Err(Box::from(status.as_str()))
    }
}

pub async fn upsert_cards(arg: Cli) -> Result<(), Box<dyn std::error::Error>> {
    if arg.file.is_none() {
        return Err(Box::from("<FILE> required to upsert cards"));
    }
    if arg.gcp_key.is_none() {
        return Err(Box::from("--gcp-key <FILE> required to upsert cards"));
    }
    let data_path = arg.file.unwrap();
    let key_path = arg.gcp_key.unwrap();
    if data_path.exists() == false {
        return Err(Box::from("--data-file does not exist"));
    }
    if key_path.exists() == false {
        return Err(Box::from("--key_path does not exist"));
    }
    match service_login(key_path.clone()).await {
        Ok(()) => {
            log::info!("🔐 Login Successful")
        }
        Err(e) => return Err(Box::from(e)),
    }
    let data_file = File::open(data_path.clone()).unwrap();
    let data_reader = BufReader::new(data_file);
    let cards: Vec<Card> = serde_json::from_reader(data_reader).unwrap();
    log::info!("🌥 Starting Upload");
    let total_size = cards.len() as u64;
    let pb = ProgressBar::new(total_size);
    for card in cards {
        upsert_card(card).await.unwrap();
        pb.inc(1)
    }
    pb.finish_and_clear();
    Ok(())
}

/**
 * Card search via firebase
 */
pub async fn card_search(
    search_params: CardSearch,
) -> Result<Vec<Card>, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let mut cards: Vec<Card> = Vec::new();
    let access_token = get_access_token();
    let id_token = format!("{} {}", "Bearer", access_token);
    let url = format!("{}{}", DATA_STORE_BASE, ":runQuery");

    let query = gcp_card_search_request(&search_params);

    log::debug!(
        "GCP request payload : \n{}",
        serde_json::to_string_pretty(&query).unwrap()
    );
    let resp: reqwest::Response = client
        .post(url)
        .header("Authorization", id_token.as_str())
        .header("Content-Type", "application/json")
        .json(&query)
        .send()
        .await
        .unwrap();
    let code = resp.status();
    let resp_json: Value = resp.json().await.unwrap();
    if code.is_success() == false {
        let log_str = format!(
            "GCP resp: \n{}",
            serde_json::to_string_pretty(&resp_json).unwrap()
        );
        log::error!("{}", log_str);
        return Err(Box::from(log_str));
    }
    if resp_json.as_array().is_none() {
        return Err(Box::from("Response was not a array"));
    }
    let resp_cards = resp_json.as_array().unwrap();
    for resp_card in resp_cards {
        let card = gcp_card_to_card(resp_card.clone());
        match card {
            Ok(val) => cards.push(val),
            Err(_) => {
                log::warn!("GCP ERR: {}", resp_json.to_string());
            }
        }
    }
    Ok(cards)
}

/**
 * Create Request for card search
 */
fn gcp_card_search_request(search_params: &CardSearch) -> Value {
    let mut order_by: Vec<Value> = Vec::new();
    let params = search_params.clone();
    log::debug!(
        "params: {}",
        serde_json::to_string_pretty(search_params).unwrap()
    );
    let mut query_val = json!(
        {
                "from" : [{
                    "collectionId": "cards",
                    "allDescendants": false
                }],
                "limit" : LIMIT
            }
    );
    let query = query_val.as_object_mut().unwrap();
    //Text search
    if search_params.name.is_none() == false {
        let name = search_params.to_owned().name.unwrap();
        let name_end = format!("{}{}", name, "\u{f8ff}");
        let name_order = json!(
            {
                "field" : {
                    "fieldPath" : "name"
                },
                "direction" : "ASCENDING"
            }
        );
        order_by.push(name_order);
        let start_at = json!({
                "values" : {"stringValue" : name}
        });
        let end_at = json!({
                "values" : {"stringValue" : name_end}
        });
        query.insert(String::from("startAt"), start_at);
        query.insert(String::from("endAt"), end_at);
    }
    // Set order
    let order = gcp_sort_json(&params);
    if order.is_none() == false {
        order_by.push(order.unwrap());
    }
    if order_by.is_empty() == false {
        query.insert(String::from("orderBy"), json!(order_by));
    }
    //Filters
    let mut filters: Vec<Value> = Vec::new();
    //Set
    if search_params.expansions.is_none() == false {
        let exps_str = search_params.to_owned().expansions.unwrap();
        let decoded_exp = urlencoding::decode(exps_str.as_str()).unwrap();
        let exp_json: Vec<String> = serde_json::from_str(decoded_exp.trim()).unwrap_or_default();
        let list = string_ary_to_gcp_ary(exp_json).unwrap();
        let exp_filter = json!({
            "fieldFilter": {
                "field": {
                "fieldPath": "expName"
                },
                "op": "IN",
                "value": {
                    "arrayValue": {
                        "values": list
                        }
                }
            }
        });
        filters.push(exp_filter);
    }
    //Rarity
    if search_params.rarities.is_none() == false {
        let rare_str = search_params.to_owned().rarities.unwrap();
        let rares_decoded = urlencoding::decode(rare_str.as_str()).unwrap();
        let rare_json: Vec<String> = serde_json::from_str(rares_decoded.trim()).unwrap_or_default();
        let rare_list = string_ary_to_gcp_ary(rare_json).unwrap();
        let rare_filter = json!({
            "fieldFilter": {
              "field": {
                "fieldPath": "rarity"
              },
              "op": "IN",
              "value": {
                "arrayValue": {
                  "values": rare_list
                }
              }
            }
        });
        filters.push(rare_filter);
    }
    if filters.is_empty() == false {
        let where_clause = json!({
          "compositeFilter": {
              "filters": filters,
              "op": "AND"
        }});
        query.insert(String::from("where"), where_clause);
    }
    let structured_query = json!({ "structuredQuery": query });
    return json!(structured_query);
}

/**
 * Query Tests
 */
#[cfg(test)]
mod query_build {
    use super::*;
    use crate::routes::poke_card::CardSearch;
    use serde_json;
    use simple_logger::SimpleLogger;

    #[test]
    fn test_empty_query() {
        let search_params = CardSearch {
            name: None,
            expansions: None,
            rarities: None,
            tags: None,
            sort: None,
        };
        let query = gcp_card_search_request(&search_params);
        println!("{}", serde_json::to_string_pretty(&query).unwrap())
    }

    #[test]
    fn test_sort_query() {
        SimpleLogger::new()
            .with_level(log::LevelFilter::Debug)
            .init()
            .unwrap();
        let mut search_params = CardSearch {
            name: None,
            expansions: None,
            rarities: None,
            tags: None,
            sort: Some(String::from("priceASC")),
        };
        let price_asc = gcp_sort_json(&search_params);
        println!("{}", serde_json::to_string_pretty(&price_asc).unwrap());
        search_params.sort = Some(String::from("priceDSC"));
        let price_dsc = gcp_sort_json(&search_params);
        println!("{}", serde_json::to_string_pretty(&price_dsc).unwrap());

        let query = gcp_card_search_request(&search_params);
        println!("{}", serde_json::to_string_pretty(&query).unwrap())
    }

    #[test]
    fn test_name_query() {
        let search_params = CardSearch {
            name: Some(String::from("Char")),
            expansions: None,
            rarities: None,
            tags: None,
            sort: None,
        };
        let query = gcp_card_search_request(&search_params);
        println!("{}", serde_json::to_string_pretty(&query).unwrap())
    }

    #[test]
    fn test_filters_query() {
        let search_params = CardSearch {
            name: None,
            expansions: Some(String::from("%5B%22Pokemon%20Go%22%5D")),
            rarities: None,
            tags: None,
            sort: None,
        };
        let query = gcp_card_search_request(&search_params);
        println!("{}", serde_json::to_string_pretty(&query).unwrap())
    }
}

/**
 * Converts from gcp wierd json to Card Struct
 */
fn gcp_card_to_card(gcp_card: Value) -> Result<Card, Box<dyn std::error::Error>> {
    //cardId
    let card_id: String;
    let option = gcp_card["document"]["fields"]["cardId"]["stringValue"].as_str();
    if option.is_none() {
        let msg = format!(
            "Card is not formated properly {}",
            serde_json::to_string_pretty(&gcp_card).unwrap()
        );
        return Err(Box::from(msg));
    } else {
        card_id = String::from(option.unwrap());
    }

    let card = Card {
        cardId: card_id,
        cardType: String::from(
            gcp_card["document"]["fields"]["cardType"]["stringValue"]
                .as_str()
                .unwrap(),
        ),
        energyType: String::from(
            gcp_card["document"]["fields"]["energyType"]["stringValue"]
                .as_str()
                .unwrap(),
        ),
        expCardNumber: String::from(
            gcp_card["document"]["fields"]["expCardNumber"]["stringValue"]
                .as_str()
                .unwrap(),
        ),
        expIdTCGP: String::from(
            gcp_card["document"]["fields"]["expIdTCGP"]["stringValue"]
                .as_str()
                .unwrap_or_default(),
        ),
        expCodeTCGP: String::from(
            gcp_card["document"]["fields"]["expCodeTCGP"]["stringValue"]
                .as_str()
                .unwrap(),
        ),
        expName: String::from(
            gcp_card["document"]["fields"]["expName"]["stringValue"]
                .as_str()
                .unwrap(),
        ),
        idTCGP: gcp_card["document"]["fields"]["idTCGP"]["integerValue"]
            .as_str()
            .unwrap()
            .parse::<i64>()
            .unwrap(),
        img: String::from(
            gcp_card["document"]["fields"]["img"]["stringValue"]
                .as_str()
                .unwrap(),
        ),
        name: String::from(
            gcp_card["document"]["fields"]["name"]["stringValue"]
                .as_str()
                .unwrap(),
        ),
        pokedex: gcp_card["document"]["fields"]["pokedex"]["integerValue"]
            .as_str()
            .unwrap()
            .parse::<i64>()
            .unwrap(),
        price: gcp_card["document"]["fields"]["price"]["doubleValue"]
            .as_f64()
            .unwrap_or_default(),
        rarity: String::from(
            gcp_card["document"]["fields"]["rarity"]["stringValue"]
                .as_str()
                .unwrap(),
        ),
        releaseDate: String::from(
            gcp_card["document"]["fields"]["releaseDate"]["timestampValue"]
                .as_str()
                .unwrap_or_default(),
        ),
        variants: gcp_ary_to_string_ary(
            gcp_card["document"]["fields"]["variants"]["arrayValue"]["values"].clone(),
        )
        .unwrap_or_default(),
        tags: None,
        variant: None,
        grade: None,
        count: None,
        paid: None,
    };
    Ok(card)
}

fn gcp_sort_json(search_params: &CardSearch) -> Option<Value> {
    if search_params.sort.is_none() == false {
        let order = search_params.to_owned().sort.unwrap();
        if order.eq("name") {
            log::debug!("Adding name Sort");
            return Some(json!(
                    {
                        "field" : {
                            "fieldPath" : "name"
                        },
                        "direction" : "ASCENDING"
                    }
            ));
        } else if order.eq("setNumber") {
            log::debug!("Adding set number Sort");
            return Some(json!(
                {
                    "field" : {
                        "fieldPath" : "expCardNumber"
                    },
                    "direction" : "ASCENDING"
                }
            ));
        } else if order.eq("pokedex") {
            log::debug!("Adding pokedex Sort");
            return Some(json!(
                {
                    "field" : {
                        "fieldPath" : "pokedex"
                    },
                    "direction" : "ASCENDING"
                }
            ));
        } else if order.eq("priceASC") {
            log::debug!("Adding price ASC Sort");
            return Some(json!(
                {
                    "field" : {
                        "fieldPath" : "price"
                    },
                    "direction" : "ASCENDING"
                }
            ));
        } else if order.eq("priceDSC") {
            log::debug!("Adding price DSC Sort");
            return Some(json!(
                    {
                        "field" : {
                            "fieldPath" : "price"
                        },
                        "direction" : "DESCENDING"
                    }
            ));
        } else if order.eq("dateASC") {
            log::debug!("Adding date ASC Sort");
            return Some(json!(
                {
                    "field" : {
                        "fieldPath" : "releaseDate"
                    },
                    "direction" : "ASCENDING"
                }
            ));
        } else if order.eq("dateDSC") {
            log::debug!("Adding date DSC Sort");
            return Some(json!(
                {
                    "field" : {
                        "fieldPath" : "releaseDate"
                    },
                    "direction" : "DESCENDING"
                }
            ));
        } else {
            log::warn!("Sort value not supported: {}", order);
            return None;
        }
    } else {
        log::debug!("No sort was in sort params");
        return None;
    }
}
