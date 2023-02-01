use lazy_static::lazy_static;
use crate::utils::shared::{get_data_dir};

lazy_static! {
    pub static ref PRICES_DB_PATH: String = format!("{}{}", get_data_dir(), "/prices.sql");
}