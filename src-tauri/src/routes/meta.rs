use crate::utils::settings::{ Settings, get_settings, write_settings, update_settings};
use crate::utils::shared::{get_static_resources, delete_all_files, get_data_dir};
use crate::utils::update_manager::{check_for_updates, read_db_status};
use actix_web::{error, delete, get, post, put, web, HttpResponse, Responder, Result};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct OpenReq {
    url: String,
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

// Get the admin database location
#[get("/meta/settings")]
pub async fn get_settings_rest() -> Result<impl Responder> {
    let settings = get_settings();
    Ok(web::Json(settings))
}

/// Update the admin database location
#[put("/meta/settings")]
pub async fn set_settings(req: web::Json<Settings>) -> Result<impl Responder> {
    let settings = req.0;
    write_settings(&settings)?;
    update_settings(settings);
    Ok(HttpResponse::Accepted())
}


#[derive(Deserialize)]
pub struct CardCacheDelete{
    exp: Option<String>
}
/// Delete Card cache for an expantion or all 
#[delete("/meta/card_cache/{exp}")]
pub async fn delete_card_cache(path : web::Path<CardCacheDelete>) -> Result<impl Responder> {
    let dir: String;
    if path.exp.is_none(){
        dir = format!("{}/{}",get_data_dir(),"card_imgs");
    } else {
        let exp = path.into_inner().exp.unwrap();
        dir = format!("{}/{}/{}",get_data_dir(), "card_imgs", &exp);
    }
    delete_all_files(&dir);
    Ok(HttpResponse::Accepted())
}

/// Update the admin database location
#[delete("/meta/exp_cache/")]
pub async fn delete_exp_cache() -> Result<impl Responder> {
    let logo = format!("{}/{}",get_data_dir(),"exp_logo");
    let symbol = format!("{}/{}",get_data_dir(),"exp_symb");
    delete_all_files(&logo);
    delete_all_files(&symbol);
    Ok(HttpResponse::Accepted())
}