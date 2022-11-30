use crate::models::pokemon::Card;
use crate::routes::poke_card::CardSearch;
use crate::utils::collection_data::{
    add_tag, delete_card, delete_tag, get_tags, search_card_collection,
    search_card_collection_count, upsert_card,
};
use actix_web::{delete, error, get, put, web, HttpResponse, Responder, Result};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct CardCollectionResults {
    pub count: i64,
    pub cards: Vec<Card>,
}
#[derive(Deserialize, Serialize)]
pub struct Tag {
    pub name: String,
    pub color: String,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct UpsertOptions {
    tag_merge: Option<bool>,
}

#[put("/pokemon/tag")]
pub async fn put_tag(collection: web::Json<Tag>) -> Result<impl Responder> {
    match add_tag(collection.into_inner()) {
        Ok(()) => Ok(HttpResponse::Accepted()),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

#[delete("/pokemon/tag")]
pub async fn remove_tag(collection: web::Json<Tag>) -> Result<impl Responder> {
    match delete_tag(collection.into_inner()) {
        Ok(()) => Ok(HttpResponse::Accepted()),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

#[get("/pokemon/tags")]
pub async fn get_all_tags() -> Result<impl Responder> {
    match get_tags() {
        Ok(tags) => Ok(web::Json(tags)),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

#[put("/pokemon/collection/cards")]
pub async fn put_card(
    card: web::Json<Card>,
    options: web::Query<UpsertOptions>,
) -> Result<impl Responder> {
    let mut _card = card.into_inner();
    let tag_merge: bool;

    if options.tag_merge.is_none() {
        tag_merge = false;
    } else if options.tag_merge.unwrap() == false {
        tag_merge = false;
    } else {
        tag_merge = true;
    }
    
    if tag_merge {
        let card_id = _card.cardId.clone();
        let found_list = search_card_collection(0, Some(card_id), None, None, None, None, Some(1))?;
        if found_list.len() > 0 {
            let found = found_list[0].clone();
            let mut merged: Vec<String>;
            if found.tags.is_none() {
                merged = Vec::new();
            } else {
                merged = found.tags.unwrap();
            }
            let new_tags: Vec<String>;
            if _card.tags.is_none() {
                new_tags = Vec::new();
            } else {
                new_tags = _card.tags.unwrap();
            }
            for tag in new_tags {
                let tag_found = merged.iter().position(|e| e.eq(&tag));
                if tag_found.is_none() {
                    merged.push(tag);
                }
            }
            _card.tags = Some(merged);
        }
    }
    match upsert_card(&_card) {
        Ok(()) => Ok(HttpResponse::Accepted()),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

#[delete("/pokemon/collection/cards")]
pub async fn remove_card(card: web::Json<Card>) -> Result<impl Responder> {
    match delete_card(card.into_inner()) {
        Ok(()) => Ok(HttpResponse::Accepted()),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

#[get("/pokemon/collection/cards/{page}")]
pub async fn search_cards(
    page: web::Path<u32>,
    search_params: web::Query<CardSearch>,
) -> Result<impl Responder> {
    let mut _cards: Vec<Card>;
    let count;
    let tag_str = search_params.tags.clone().unwrap_or_default();
    let _tags: String = urlencoding::decode(&tag_str).unwrap().into();

    match search_card_collection_count(
        search_params.name.clone(),
        search_params.expansions.clone(),
        search_params.rarities.clone(),
        search_params.tags.clone(),
    ) {
        Ok(val) => count = val,
        Err(e) => return Err(error::ErrorBadRequest(e)),
    }
    match search_card_collection(
        *page,
        search_params.name.clone(),
        search_params.expansions.clone(),
        search_params.rarities.clone(),
        Some(_tags),
        search_params.sort.clone(),
        None,
    ) {
        Ok(val) => _cards = val,
        Err(e) => return Err(error::ErrorBadRequest(e)),
    }
    Ok(web::Json(CardCollectionResults {
        count: count,
        cards: _cards,
    }))
}