use crate::models::pokemon::{Expantion, Series, Card};
use crate::routes::poke_card::{card_search_helper, CardSearch};
use crate::utils::pokemon_data::{
    delete_card, delete_expantion, delete_series, get_expansion, get_expansions, get_rarities,
    get_series, get_series_list, upsert_card, upsert_expantion, upsert_series
};
use crate::utils::shared::{get_admin_file_path, get_admin_mode};
use actix_web::{delete, error, get, put, web, HttpResponse, Responder, Result};
use serde::{Serialize, Deserialize};
#[derive(Serialize)]
#[derive(Deserialize)]
struct AdminSettings {
    admin: bool,
    path: String,
}

/// Get admin mode
#[get("/admin_settings")]
pub async fn admin_mode() -> Result<impl Responder> {
    let settings = AdminSettings{admin: get_admin_mode(), path: get_admin_file_path()};
    Ok(web::Json(settings))
}

/* ---------------------------------------------------------
  EXPANTIONS
--------------------------------------------------------- */

/// Get admin expansions
#[get("/admin/pokemon/expansions")]
pub async fn admin_expansions() -> Result<impl Responder> {
    let mut _expansions: Vec<Expantion> = get_expansions(Some(get_admin_file_path()))?;
    Ok(web::Json(_expansions))
}

/// Get admin expansion via name
#[get("/admin/pokemon/expansion/{name}")]
pub async fn admin_expantion_by_name(name: web::Path<String>) -> Result<impl Responder> {
    match get_expansion(name.to_string(), Some(get_admin_file_path())) {
        Ok(data) => Ok(web::Json(data)),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

/// Upsert Expantion
#[put("/admin/pokemon/expantion")]
pub async fn admin_upsert_expansion(exp: web::Json<Expantion>) -> Result<impl Responder> {
    match upsert_expantion(&exp.0) {
        Ok(_) => Ok(HttpResponse::Accepted()),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

/// Delte Expantion
#[delete("/admin/pokemon/expantion")]
pub async fn admin_delete_expansion(exp: web::Json<Expantion>) -> Result<impl Responder> {
    match delete_expantion(exp.0.name) {
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
    let mut _series: Vec<Series> = get_series_list(Some(get_admin_file_path())).unwrap();
    Ok(web::Json(_series))
}

/// Get admins series via name
#[get("/admin/pokemon/series/{name}")]
pub async fn admin_series_by_name(name: web::Path<String>) -> Result<impl Responder> {
    match get_series(name.to_string(), Some(get_admin_file_path())) {
        Ok(data) => Ok(web::Json(data)),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

/// Upsert series
#[put("/admin/pokemon/series")]
pub async fn admin_upsert_series(exp: web::Json<Series>) -> Result<impl Responder> {
    match upsert_series(&exp.0) {
        Ok(data) => Ok(web::Json(data)),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

/// Delete series
#[delete("/admin/pokemon/series")]
pub async fn admin_delete_series(series: web::Json<Series>) -> Result<impl Responder> {
    match delete_series(series.0.name) {
        Ok(_) => Ok(HttpResponse::Accepted()),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

/* ---------------------------------------------------------
  Rarities
--------------------------------------------------------- */

/// Get admin rarities
#[get("/admin/pokemon/card/rarities")]
pub async fn admin_rarities() -> Result<impl Responder> {
    match get_rarities(Some(get_admin_file_path())) {
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
    match card_search_helper(*page, search_params.0, Some(get_admin_file_path())).await {
        Ok(results) => Ok(web::Json(results)),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

/// Upsert Card
#[put("/admin/pokemon/card")]
pub async fn admin_upsert_card(card: web::Json<Card>) -> Result<impl Responder> {
    match upsert_card(&card.0) {
        Ok(_) => Ok(HttpResponse::Accepted()),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}

/// Delete Card
#[delete("/admin/pokemon/card")]
pub async fn admin_delete_card(card: web::Json<Card>) -> Result<impl Responder> {
    match delete_card(&card.0.name) {
        Ok(_) => Ok(HttpResponse::Accepted()),
        Err(e) => Err(error::ErrorBadRequest(e)),
    }
}