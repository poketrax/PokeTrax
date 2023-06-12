use crate::utils::{
    shared::{self, get_data_dir},
    sql_pokemon_data,
};
use actix_web::{get, web, HttpRequest, HttpResponse, Responder, Result};
use lazy_static::lazy_static;
use reqwest::StatusCode;
use std::{fs::create_dir_all, path::Path};
use urlencoding;

lazy_static! {
    static ref DEFAULT_IMG: String = format!("{}{}", get_data_dir(), "/pokemon-back.png");
    pub static ref CARD_IMG_PATH: String = format!("{}{}", get_data_dir(), "/card_imgs/");
    pub static ref SERIES_IMG_PATH: String = format!("{}{}", get_data_dir(), "/series_imgs/");
    pub static ref EXP_LOGO_PATH: String = format!("{}{}", get_data_dir(), "/exp_logo/");
    pub static ref EXP_SYMB_PATH: String = format!("{}{}", get_data_dir(), "/exp_symb/");
}

async fn img_response(path: &str) -> Result<HttpResponse> {
    let _path = path.to_owned();
    let image_content = web::block(|| std::fs::read(_path)).await??;
    Ok(HttpResponse::Ok()
        .content_type("image/jpg")
        .body(image_content))
}

fn error_response() -> Result<HttpResponse> {
    Ok(HttpResponse::NotFound().body("Not found"))
}

#[get("/pokemon/card_img/{exp}/{id}")]
async fn card_img(req: HttpRequest) -> Result<impl Responder> {
    //pull params
    let exp: String = req.match_info().get("exp").unwrap().parse()?;
    let _exp: String = urlencoding::decode(exp.as_str()).unwrap().replace(" ", "-");
    let _id: String = req.match_info().query("id").parse()?;
    let id: String = urlencoding::decode(&_id).unwrap_or_default().into_owned();
    //make sure exp directory is their
    let exp_path_str = format!("{}{}", CARD_IMG_PATH.as_str(), _exp);
    let exp_path = Path::new(&exp_path_str);
    if exp_path.exists() {
        create_dir_all(exp_path)?;
    }
    //get Ready to pull or save file
    let path_name = format!("{}{}/{}{}", CARD_IMG_PATH.as_str(), _exp, id, ".jpg");
    let github_path = format!(
        "https://raw.githubusercontent.com/poketrax/pokedata/main/images/cards/{}/{}.jpg",
        _exp,
        str::replace(&id, "/", "-")
    );
    let path = Path::new(path_name.as_str());
    //if card img is in the cache send it
    if path.exists() {
        Ok(img_response(&path_name).await?)
    } else {
        //Try to pull card and cache it
        match sql_pokemon_data::get_card(&id, None) {
            Ok(card) => match shared::download_file(&github_path, path_name.as_str()).await {
                Ok(()) => {
                    log::debug!("Downloading Card Img from GitHub");
                    Ok(img_response(&path_name).await?)
                }
                Err(e) => {
                    log::warn!("Failed to download img from GitHub : {}\n{}", card.img, e);
                    match shared::download_file(card.img.as_str(), path_name.as_str()).await {
                        Ok(()) => {
                            log::debug!("Downloading Card Img from Soruce");
                            Ok(img_response(&path_name).await?)
                        }
                        Err(_) => {
                            log::warn!(
                                "DOUBLE FAIL!! failed to download Img from Source : {}",
                                card.img.as_str()
                            );
                            Ok(img_response(DEFAULT_IMG.as_str()).await?)
                        }
                    }
                }
            },
            Err(_) => {
                log::warn!("Failed to find card : {}", id);
                Ok(img_response(DEFAULT_IMG.as_str()).await?)
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
    let git_hub_url = format!(
        "https://raw.githubusercontent.com/poketrax/pokedata/main/images/exp_logo/{}.png",
        name.replace(" ", "-")
    );
    let path = Path::new(path_name.as_str());
    //if card img is in the cache send it
    if path.exists() {
        Ok(img_response(&path_name).await?)
    } else {
        //Try to pull card and cache it
        match sql_pokemon_data::get_expansion(_name.to_string(), None) {
            Ok(exp) => match shared::download_file(&git_hub_url, path_name.as_str()).await {
                Ok(()) => Ok(img_response(&path_name).await?),
                Err(e) => {
                    log::warn!(
                        "Failed to download img from Github : {}\n{}",
                        git_hub_url,
                        e
                    );
                    match shared::download_file(&exp.logoURL, &path_name).await {
                        Ok(()) => Ok(img_response(&path_name).await?),
                        Err(_) => {
                            log::warn!(
                                "DOUBLE FAIL!! failed to download Img from Source: {}",
                                &exp.logoURL
                            );
                            Ok(img_response(DEFAULT_IMG.as_str()).await?)
                        }
                    }
                }
            },
            Err(_) => {
                log::warn!("Failed to find Expansion : {}", _name);
                Ok(error_response()?)
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
    let git_hub_url = format!(
        "https://raw.githubusercontent.com/poketrax/pokedata/main/images/exp_symb/{}.png",
        name.replace(" ", "-")
    );
    let path = Path::new(path_name.as_str());
    //if card img is in the cache send it
    if path.exists() {
        Ok(img_response(&path_name).await?)
    } else {
        //Try to pull card and cache it
        match sql_pokemon_data::get_expansion(_name.to_string(), None) {
            Ok(exp) => {
                match shared::download_file(&git_hub_url, &path_name)
                    .await
                {
                    Ok(()) => {
                        Ok(img_response(&path_name).await?)
                    }
                    Err(e) => {
                        log::warn!(
                            "Failed to download img from Github : {}\n{}",
                            git_hub_url,
                            e
                        );
                        match shared::download_file(&exp.symbolURL, &path_name).await {
                            Ok(()) => {
                                Ok(img_response(&path_name).await?)
                            }
                            Err(_) => {
                                log::warn!(
                                    "DOUBLE FAIL!! failed to download Img from Source: {}",
                                    &exp.symbolURL
                                );
                                Ok(img_response(DEFAULT_IMG.as_str()).await?)
                            }
                        }
                        
                    }
                }
            }
            Err(_) => {
                log::warn!("Failed to find Expansion : {}", _name);
                Ok(error_response()?)
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
