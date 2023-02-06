use crate::utils::{
    sql_pokemon_data,
    shared::{self, get_data_dir},
};
use actix_web::{get, web, HttpRequest, HttpResponse, Responder, Result};
use lazy_static::lazy_static;
use reqwest::StatusCode;
use std::{fs::create_dir_all, path::Path};
use urlencoding;

lazy_static! {
    static ref DEFAULT_IMG: String = format!("{}{}", get_data_dir(),"/pokemon-back.png");
    pub static ref CARD_IMG_PATH: String = format!("{}{}", get_data_dir(), "/card_imgs/");
    pub static ref SERIES_IMG_PATH: String = format!("{}{}", get_data_dir(), "/series_imgs/");
    pub static ref EXP_LOGO_PATH: String = format!("{}{}", get_data_dir(), "/exp_logo/");
    pub static ref EXP_SYMB_PATH: String = format!("{}{}", get_data_dir(), "/exp_symb/");
}

#[get("/pokemon/card_img/{exp}/{id}")]
async fn card_img(req: HttpRequest) -> Result<impl Responder> {
    //pull params
    let exp: String = req.match_info().get("exp").unwrap().parse()?;
    let _exp: String = urlencoding::decode(exp.as_str()).unwrap().replace(" ", "-");
    let _id: String = req.match_info().query("id").parse()?;
    let id: String = urlencoding::decode(&_id).unwrap_or_default().into_owned();
    //make sure exp directory is their
    let exp_path = format!("{}{}", CARD_IMG_PATH.as_str(), _exp);
    create_dir_all(exp_path).unwrap();
    //get Ready to pull or save file
    let path_name = format!("{}{}/{}{}", CARD_IMG_PATH.as_str(), _exp, id, ".jpg");
    let path = Path::new(path_name.as_str());
    //if card img is in the cache send it
    if path.exists() {
        let image_content = web::block(|| std::fs::read(path_name))
            .await
            .unwrap()
            .unwrap();
        Ok(HttpResponse::build(StatusCode::OK)
            .content_type("image/jpg")
            .body(image_content))
    } else {
        //Try to pull card and cache it
        match sql_pokemon_data::get_card(&id, None) {
            Ok(card) => {
                match shared::download_file(card.img.as_str(), path_name.as_str()).await {
                    Ok(()) => {
                        let image_content = web::block(|| std::fs::read(path_name)).await??;
                        log::debug!("Downloading Card Img");
                        Ok(HttpResponse::build(StatusCode::OK)
                            .content_type("image/jpg")
                            .body(image_content))
                    }
                    Err(e) => {
                        log::warn!("Failed to download img : {}\n{}", card.img, e);
                        let image_content = web::block(|| std::fs::read(DEFAULT_IMG.as_str())).await??;
                        Ok(HttpResponse::build(StatusCode::OK)
                            .content_type("image/jpg")
                            .body(image_content))
                    }
                }
            }
            Err(_) => {
                log::warn!("Failed to find card : {}", id);
                let image_content = web::block(|| std::fs::read(DEFAULT_IMG.as_str())).await??;
                Ok(HttpResponse::build(StatusCode::OK)
                    .content_type("image/jpg")
                    .body(image_content))
            }
        }
    }
}

#[get("/pokemon/expansion/logo/{name}")]
async fn exp_logo(name: web::Path<String>) -> Result<impl Responder> {
    //pull params
    let _name = urlencoding::decode(name.as_str()).unwrap();
    //get Ready to pull or save file
    let path_name = format!(
        "{}{}{}",
        EXP_LOGO_PATH.as_str(),
        name.replace(" ", "-"),
        ".png"
    );
    let path = Path::new(path_name.as_str());
    //if card img is in the cache send it
    if path.exists() {
        let image_content = web::block(|| std::fs::read(path_name))
            .await
            .unwrap()
            .unwrap();
        Ok(HttpResponse::build(StatusCode::OK)
            .content_type("image/png")
            .body(image_content))
    } else {
        //Try to pull card and cache it
        match sql_pokemon_data::get_expansion(_name.to_string(), None) {
            Ok(exp) => {
                match shared::download_file(exp.logoURL.as_str().clone(), path_name.as_str()).await
                {
                    Ok(()) => {
                        let image_content = web::block(|| std::fs::read(path_name))
                            .await
                            .unwrap()
                            .unwrap();
                        log::info!("Downloading Exp Logo");
                        Ok(HttpResponse::build(StatusCode::OK)
                            .content_type("image/png")
                            .body(image_content))
                    }
                    Err(e) => {
                        log::warn!("Failed to download img : {}\n{}", exp.logoURL, e);
                        let image_content = web::block(|| std::fs::read(DEFAULT_IMG.as_str()))
                            .await
                            .unwrap()
                            .unwrap();
                        Ok(HttpResponse::build(StatusCode::OK)
                            .content_type("image/png")
                            .body(image_content))
                    }
                }
            }
            Err(e) => {
                log::warn!("Failed to find Expansion : {}", _name);
                Ok(HttpResponse::build(StatusCode::NOT_FOUND).body(e.to_string()))
            }
        }
    }
}

#[get("/pokemon/expansion/symbol/{name}")]
async fn exp_symbol(name: web::Path<String>) -> Result<impl Responder> {
    //pull params
    let _name = urlencoding::decode(name.as_str()).unwrap();
    //get Ready to pull or save file
    let path_name = format!(
        "{}{}{}",
        EXP_SYMB_PATH.as_str(),
        name.replace(" ", "-"),
        ".png"
    );
    let path = Path::new(path_name.as_str());
    //if card img is in the cache send it
    if path.exists() {
        let image_content = web::block(|| std::fs::read(path_name))
            .await
            .unwrap()
            .unwrap();
        Ok(HttpResponse::build(StatusCode::OK)
            .content_type("image/png")
            .body(image_content))
    } else {
        //Try to pull card and cache it
        match sql_pokemon_data::get_expansion(_name.to_string(), None) {
            Ok(exp) => {
                match shared::download_file(exp.symbolURL.as_str().clone(), path_name.as_str())
                    .await
                {
                    Ok(()) => {
                        let image_content = web::block(|| std::fs::read(path_name))
                            .await
                            .unwrap()
                            .unwrap();
                        log::info!("Downloading Exp Symbol");
                        Ok(HttpResponse::build(StatusCode::OK)
                            .content_type("image/png")
                            .body(image_content))
                    }
                    Err(e) => {
                        log::warn!("Failed to download img : {}\n{}", exp.symbolURL, e);
                        let image_content = web::block(|| std::fs::read(DEFAULT_IMG.as_str()))
                            .await
                            .unwrap()
                            .unwrap();
                        Ok(HttpResponse::build(StatusCode::OK)
                            .content_type("image/png")
                            .body(image_content))
                    }
                }
            }
            Err(e) => {
                log::warn!("Failed to find Expansion : {}", _name);
                Ok(HttpResponse::build(StatusCode::NOT_FOUND).body(e.to_string()))
            }
        }
    }
}

#[get("/pokemon/series/img/{name}")]
async fn series_symbol(name: web::Path<String>) -> Result<impl Responder> {
    //pull params
    let _name = urlencoding::decode(name.as_str()).unwrap();
    //get Ready to pull or save file
    let path_name = format!(
        "{}{}{}",
        SERIES_IMG_PATH.as_str(),
        name.replace(" ", "-"),
        ".png"
    );
    let path = Path::new(path_name.as_str());
    //if card img is in the cache send it
    if path.exists() {
        let image_content = web::block(|| std::fs::read(path_name))
            .await
            .unwrap()
            .unwrap();
        Ok(HttpResponse::build(StatusCode::OK)
            .content_type("image/png")
            .body(image_content))
    } else {
        //Try to pull card and cache it
        match sql_pokemon_data::get_series(_name.to_string(), None) {
            Ok(series) => {
                match shared::download_file(series.icon.as_str().clone(), path_name.as_str()).await
                {
                    Ok(()) => {
                        let image_content = web::block(|| std::fs::read(path_name))
                            .await
                            .unwrap()
                            .unwrap();
                        log::info!("Downloading Series Symbol");
                        Ok(HttpResponse::build(StatusCode::OK)
                            .content_type("image/png")
                            .body(image_content))
                    }
                    Err(e) => {
                        log::warn!("Failed to download img : {}\n{}", series.icon, e);
                        let image_content = web::block(|| std::fs::read(DEFAULT_IMG.as_str()))
                            .await
                            .unwrap()
                            .unwrap();
                        Ok(HttpResponse::build(StatusCode::OK)
                            .content_type("image/png")
                            .body(image_content))
                    }
                }
            }
            Err(e) => {
                log::warn!("Failed to find Series : {}", _name);
                Ok(HttpResponse::build(StatusCode::NOT_FOUND).body(e.to_string()))
            }
        }
    }
}
