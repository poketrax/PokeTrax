use actix_web::{web,error, Responder, Result, get, post};
use serde::{Serialize, Deserialize};
use crate::utils::pokemon_data::{initialize_data};
use crate::utils::shared::get_static_resources;

#[derive(Deserialize, Serialize)]
pub struct OpenReq{
    url: String
}

#[get("/meta/db_status")]
pub async fn init() -> Result<impl Responder>{
    get_static_resources().await;
    match initialize_data().await {
        Err(e) => return Err(actix_web::error::ErrorInternalServerError(e)),
        Ok(status) => return Ok(web::Json(status)),
    }
}

#[post("/meta/open")]
pub async fn open(req: web::Json<OpenReq>) -> Result<impl Responder>{
    if webbrowser::open(req.url.as_str()).is_ok() {
        Ok("launched")
    }else{
        Err(error::ErrorInternalServerError("failed to launch"))
    }
}

