use crate::models::pokemon::{Card, SealedProduct};
use crate::routes::poke_card::CardSearch;
use crate::routes::poke_product::{ProductSearch, ProductSearchResults};
use crate::utils::shared::sort_sql;
use crate::utils::sql_collection_data::{
    add_tag, delete_card, delete_tag, get_tags, search_card_collection,
    search_card_collection_count, upsert_card, search_product_collection, 
    product_collection_count, upsert_product, delete_product
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
    overwrite: Option<bool>
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
    let tag_str = search_params.0.tags.clone().unwrap_or_default();
    let _tags: String = urlencoding::decode(&tag_str).unwrap().into();
    let sort: String = sort_sql(&search_params.0.sort.unwrap_or_default());

    match search_card_collection_count(
        search_params.0.name.clone(),
        search_params.0.expansions.clone(),
        search_params.0.rarities.clone(),
        search_params.0.tags,
    ) {
        Ok(val) => count = val,
        Err(e) => return Err(error::ErrorBadRequest(e)),
    }
    match search_card_collection(
        *page,
        search_params.0.name,
        search_params.0.expansions,
        search_params.0.rarities,
        Some(_tags),
        Some(sort),
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

#[get("/pokemon/collection/products/{page}")]
pub async fn search_products(
    page: web::Path<u32>,
    search_params: web::Query<ProductSearch>
) -> Result<impl Responder> {
    let products: Vec<SealedProduct>;
    let sort: String = sort_sql(&search_params.0.sort.unwrap_or_default());
    let count: i64;
    match product_collection_count(search_params.0.name.clone(), search_params.0.types.clone(), search_params.0.tags.clone()){
        Ok(val) => count = val,
        Err(e) => return Err(error::ErrorBadRequest(e))
    }
    match search_product_collection(*page, search_params.0.name, search_params.0.types, search_params.0.tags, Some(sort)){
        Ok(val) => products = val,
        Err(e) => return Err(error::ErrorBadRequest(e))
    }
    Ok(web::Json(ProductSearchResults {
        count: count,
        products: products
    }))
}

#[put("/pokemon/collection/product")]
pub async fn put_product(options: web::Query<UpsertOptions>, product: web::Json<SealedProduct>) -> Result<impl Responder>{
    match upsert_product(&product, options.0.overwrite) {
        Ok(()) => Ok(HttpResponse::Accepted()),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

#[delete("/pokemon/collection/product")]
pub async fn remove_product(product: web::Json<SealedProduct>) -> Result<impl Responder>{
    match delete_product(&product) {
        Ok(()) => Ok(HttpResponse::Accepted()),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}