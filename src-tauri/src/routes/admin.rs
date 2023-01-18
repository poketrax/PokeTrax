use crate::models::pokemon::{Expantion, Series};
use crate::routes::poke_card::{card_search_helper, CardSearch};
use crate::utils::pokemon_data::{
    get_expansion, get_expansions, get_rarities, get_series, get_series_list, upsert_expantion,
};
use crate::utils::shared::get_admin_file_path;
use actix_web::{error, get, put, web, HttpResponse, Responder, Result};

/* ---------------------------------------------------------
  EXPANTIONS
--------------------------------------------------------- */

/// Get admin expansions
#[get("/admin/pokemon/expansions")]
pub async fn admin_expansions() -> Result<impl Responder> {
    let mut _expansions: Vec<Expantion> = get_expansions(Some(get_admin_file_path())).await?;
    Ok(web::Json(_expansions))
}

/// Get admin expansion via name
#[get("/admin/pokemon/expansion/{name}")]
pub async fn admin_expantion_by_name(name: web::Path<String>) -> Result<impl Responder> {
    match get_expansion(name.to_string(), Some(get_admin_file_path())).await {
        Ok(data) => Ok(web::Json(data)),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

#[put("/admin/pokemon/expantion")]
pub async fn admin_upsert_expansion(exp: web::Json<Expantion>) -> Result<impl Responder> {
    match upsert_expantion(exp.0).await {
        Ok(_) => Ok(HttpResponse::Accepted()),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

/* ---------------------------------------------------------
  Series
--------------------------------------------------------- */

/// Get admin series
#[get("/admin/pokemon/series")]
pub async fn admin_series() -> Result<impl Responder> {
    let mut _series: Vec<Series> = get_series_list(Some(get_admin_file_path())).await.unwrap();
    Ok(web::Json(_series))
}

/// Get admins series via name
#[get("/admin/pokemon/series/{name}")]
pub async fn admin_series_by_name(name: web::Path<String>) -> Result<impl Responder> {
    match get_series(name.to_string(), Some(get_admin_file_path())).await {
        Ok(data) => Ok(web::Json(data)),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

/* ---------------------------------------------------------
  Rarities
--------------------------------------------------------- */

/// Get admin rarities
#[get("/admin/pokemon/card/rarities")]
pub async fn admin_rarities() -> Result<impl Responder> {
    match get_rarities(Some(get_admin_file_path())).await {
        Ok(rarities_list) => Ok(web::Json(rarities_list)),
        Err(e) => Err(error::ErrorInternalServerError(e)),
    }
}

/* ---------------------------------------------------------
  Cards
--------------------------------------------------------- */

/// Get admin cards
#[get("/admin/pokemon/cards/{page}")]
pub async fn admin_card_search(
    page: web::Path<u32>,
    search_params: web::Query<CardSearch>,
) -> Result<impl Responder> {
    match (card_search_helper(*page, search_params.0, Some(get_admin_file_path())).await) {
        Ok(results) => Ok(web::Json(results)),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}
