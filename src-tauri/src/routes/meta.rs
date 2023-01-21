use crate::utils::pokemon_data::initialize_data;
use crate::utils::shared::{get_static_resources, update_admin_file_path, get_admin_file_path};
use actix_web::{error, get, post, put, web, HttpResponse, Responder, Result,};
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
#[get("/meta/db_status")]
pub async fn init() -> Result<impl Responder> {
    get_static_resources().await;
    match initialize_data().await {
        Err(e) => return Err(actix_web::error::ErrorInternalServerError(e)),
        Ok(status) => return Ok(web::Json(status)),
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
    let path = AdminDB {data_path: get_admin_file_path()};
    Ok(web::Json(path))
}