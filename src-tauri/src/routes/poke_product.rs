use crate::{models::pokemon::SealedProduct, utils::shared::sort_sql};
use crate::utils::sql_pokemon_data;
use actix_web::{error, get, web, Responder, Result};
use serde::{Deserialize, Serialize};
use urlencoding;

#[derive(Deserialize, Serialize, Clone)]
pub struct ProductSearch {
    pub name: Option<String>,
    pub types: Option<String>,
    pub sort: Option<String>,
    pub tags: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub struct ProductSearchResults {
    pub count: i64,
    pub products: Vec<SealedProduct>,
}

#[get("/pokemon/products/{page}")]
pub async fn product_search(
    page: web::Path<u32>,
    search_params: web::Query<ProductSearch>,
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
    let sort: String = sort_sql(&order);
    let count: i64;

    match sql_pokemon_data::product_count(Some(name_filter.clone()), search_params.0.types.clone(), None) {
        Ok(val) => count = val,
        Err(e) => return Err(error::ErrorInternalServerError(e)),
    }

    let products: Vec<SealedProduct>;
    match sql_pokemon_data::product_search_sql(
        *page,
        Some(name_filter.clone()),
        search_params.0.types,
        Some(sort),
        None,
    ) {
        Ok(val) => products = val,
        Err(e) => return Err(error::ErrorInternalServerError(e)),
    }
    let results = ProductSearchResults {
        count: count,
        products: products,
    };
    Ok(web::Json(results))
}

/// Get Product Types
/// Returns a list of product types
#[get("/pokemon/product/types")]
pub async fn product_types() -> Result<impl Responder> {
    let types = sql_pokemon_data::get_product_types(None)?;
    Ok(web::Json(types))
}