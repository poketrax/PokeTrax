#![windows_subsystem = "windows"]
extern crate simple_error;
extern crate reqwest;
use actix_web::{HttpServer, rt, App};
use actix_cors::Cors;
use utils::gcp::upsert_cards;
use std::{sync::mpsc, thread, fs::create_dir_all, path::PathBuf};
use log::LevelFilter;
use clap::{Parser};
use simple_logger::SimpleLogger;
use tokio::runtime::Runtime;
use log::{info, error, debug};

mod routes;
use routes::poke_card;
use routes::meta;
use routes::img_handler;
use routes::auth;
use routes::poke_product;
use routes::collections;

mod models;
mod utils;
use utils::collection_data;

const PORT: u16 = 3131;

#[derive(Parser, Clone, Debug)]
#[clap(author, version, about, long_about = None)]
pub struct Cli {
    ///Run in Headless mode
    #[clap(short, long, value_parser, default_value_t = false)]
    daemon: bool,
    ///Run in verboss mode
    #[clap(short, long, value_parser, default_value_t = false)]
    verbose: bool,
    ///GCP key file for authorization
    #[clap(long, value_parser, value_name = "KEY_FILE")]
    gcp_key: Option<PathBuf>,
    ///Supported data command patterns:  cards | series | expantions | all 
    #[clap(value_parser)]
    data: Option<String>,
    ///Supported data command patterns:  cards [upsert | delete] <File> | series [upsert| delete] <File> | expantions [upsert| delete] <File> | all [export] <File>
    #[clap(value_parser)]
    command: Option<String>,
    ///Supported data command patterns:  cards [upsert | delete] <File> | series [upsert| delete] <File> | expantions [upsert| delete] <File> | all [export] <File>
    #[clap(value_parser)]
    file: Option<PathBuf>,
}

async fn start_rest_api() -> std::io::Result<()> {
    let (tx, _) = mpsc::channel();
    log::info!("Starting HTTP server at http://localhost:{}", PORT.to_string());
    // srv is server controller type, `dev::Server`
    let server = HttpServer::new(|| {
        let cors = Cors::permissive()
            .allow_any_origin();
        App::new()
            .wrap(cors)
            .service(poke_card::expansions)
            .service(poke_card::series)
            .service(poke_card::series_by_name)
            .service(poke_card::rarities)
            .service(poke_card::card_search)
            .service(poke_card::card_prices)
            .service(poke_card::expantion_by_name)
            .service(poke_card::card_search_gcp)
            .service(poke_product::product_search)
            .service(collections::get_all_tags)
            .service(collections::put_tag)
            .service(collections::remove_tag)
            .service(collections::search_cards)
            .service(collections::put_card)
            .service(collections::remove_card)
            .service(meta::init)
            .service(meta::open)
            .service(img_handler::card_img)
            .service(img_handler::exp_symbol)
            .service(img_handler::exp_logo)
            .service(auth::auth_callback)
            .service(auth::login)
            .service(auth::expire)
            .service(auth::jwt_token)
    })
    .bind(("127.0.0.1", PORT))?
    .workers(2)
    .run();
    // Send server handle back to the main thread
    let _ = tx.send(server.handle());
    server.await
}

fn main(){
    let args = Cli::parse().clone();
    //set up logging
    let mut level = LevelFilter::Info;
    if args.verbose { level = LevelFilter::Debug;}
    SimpleLogger::new().with_level(level).init().unwrap();
    init_data_paths();

    collection_data::initialize_data();

    //Check for cli commands
    let data_type = args.data.clone().unwrap_or_default().to_lowercase();
    if data_type.eq("cards") {
        let runtime = Runtime::new().unwrap();
        let command = args.command.clone();
        if command.is_none() {
            error!("no compatible command found. cards only works with upsert and delete");
        }else{
            let command_str = command.unwrap().to_lowercase();
            if command_str.eq("upsert"){
                match runtime.block_on(upsert_cards(args)) {
                    Ok(()) => (),
                    Err(e) => { error!("Failed to Upsert Cards: {}", e) }
                }
            }else if command_str.eq("delete"){
                info!("Delete is not yet supported");
            } else if command_str.eq("export"){
                info!("Export is not yet supported");
            }
        }
    } else {
        if args.daemon == false {
           thread::spawn(move || {
                let server_future = start_rest_api();
                rt::System::new().block_on(server_future).unwrap()
            });
            //Start Tauri
            tauri::Builder::default()
                .run(tauri::generate_context!())
                .expect("error while running tauri application");
        }else{
            let server_future = start_rest_api();
            rt::System::new().block_on(server_future).unwrap();
        }
    }
}

/**
 * Initialize Data storage paths
 */
fn init_data_paths(){
    debug!("Data dir: {}", utils::shared::get_data_dir());
    create_dir_all(utils::shared::get_data_dir()).unwrap();
    create_dir_all(img_handler::CARD_IMG_PATH.as_str()).unwrap();
    create_dir_all(img_handler::EXP_LOGO_PATH.as_str()).unwrap();
    create_dir_all(img_handler::EXP_SYMB_PATH.as_str()).unwrap();
    create_dir_all(img_handler::SERIES_IMG_PATH.as_str()).unwrap();
}