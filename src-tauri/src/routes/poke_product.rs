use crate::models::pokemon::SealedProduct;
use crate::utils::pokemon_data;
use actix_web::{error, get, web, Responder, Result};
use serde::{Deserialize, Serialize};
use urlencoding;

#[derive(Deserialize, Serialize, Clone)]
pub struct ProductSearch {
    pub name: Option<String>,
    pub sort: Option<String>,
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
    /*Expantion Filter
    let mut exp_filter =
        urlencoding::decode(search_params.expansions.as_deref().unwrap_or_default())
            .expect("UTF-8")
            .to_string();
    if exp_filter.eq("") == false {
        exp_filter = braces.replace_all(&exp_filter, "").to_string();
        exp_filter = format!("AND expName in ({})", exp_filter);
        //info!("expFilter {}", exp_filter.clone());
    }*/
    //Order
    let order = urlencoding::decode(search_params.sort.as_deref().unwrap_or_default())
        .expect("UTF-8")
        .to_string();
    let sort: String;
    if order.eq("name") {
        sort = String::from("ORDER BY name ASC");
    } else if order.eq("priceASC") {
        sort = String::from("ORDER BY price ASC");
    } else if order.eq("priceDSC") {
        sort = String::from("ORDER BY price DESC");
    } else {
        sort = String::from("");
    }

    let count: i64;

    match pokemon_data::product_count(Some(name_filter.clone()), None) {
        Ok(val) => count = val,
        Err(e) => return Err(error::ErrorInternalServerError(e)),
    }

    let products: Vec<SealedProduct>;
    match pokemon_data::product_search_sql(*page, Some(name_filter.clone()), Some(sort), None)
    {
        Ok(val) => products = val,
        Err(e) => return Err(error::ErrorInternalServerError(e)),
    }

    let results = ProductSearchResults {
        count: count,
        products: products,
    };
    Ok(web::Json(results))
}
