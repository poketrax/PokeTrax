use crate::utils::settings::{get_admin_file_path, update_admin_file_path};
use crate::utils::shared::get_static_resources;
use crate::utils::update_manager::{check_for_updates, read_db_status};
use actix_web::{error, get, post, put, web, HttpResponse, Responder, Result};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct OpenReq {
    url: String,
}
#[derive(Deserialize, Serialize)]
pub struct AdminDB {
    data_path: String,
}

/// Get Databases status
#[post("/meta/init")]
pub async fn init() -> Result<impl Responder> {
    get_static_resources().await;
    check_for_updates().await.unwrap();
    Ok(HttpResponse::Ok())
}

/// Get Databases status
#[get("/meta/db_status")]
pub async fn get_status() -> Result<impl Responder> {
    match read_db_status() {
        Ok(status) => return Ok(web::Json(status)),
        Err(e) => return Err(error::ErrorInternalServerError(e)),
    }
}

/// Opens a web link in the defualt browser
#[post("/meta/open")]
pub async fn open(req: web::Json<OpenReq>) -> Result<impl Responder> {
    if webbrowser::open(req.url.as_str()).is_ok() {
        Ok("launched")
    } else {
        Err(error::ErrorInternalServerError("failed to launch"))
    }
}

/// Update the admin database location
#[put("/meta/admindb")]
pub async fn set_admin_db(req: web::Json<AdminDB>) -> Result<impl Responder> {
    let path = req.into_inner().data_path;
    update_admin_file_path(path);
    Ok(HttpResponse::Accepted())
}

// Get the admin database location
#[get("/meta/admindb")]
pub async fn get_admin_db() -> Result<impl Responder> {
    let path = AdminDB {
        data_path: get_admin_file_path(),
    };
    Ok(web::Json(path))
}
