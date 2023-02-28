use serde::{Serialize, Deserialize};
#[derive(Clone)]
#[derive(Serialize)]
#[derive(Deserialize)]
#[allow(non_snake_case)]
pub struct Card{
    pub name : String,
    pub cardId: String,
    pub idTCGP: i64,

    pub expName: String,
    pub expCardNumber : String,
    pub expCodeTCGP: String,

    pub rarity: String,
    pub cardType: String,
    pub energyType: String,
    pub variants : Vec<String>,
    pub expIdTCGP: String,

    pub pokedex: i64,
    pub releaseDate: String,
    pub price: f64,
    pub img: String,

    pub tags: Option<Vec<String>>,
    pub variant: Option<String>,
    pub paid: Option<f64>,
    pub count : Option<i64>,
    pub grade : Option<String>,
}

#[derive(Serialize)]
#[derive(Deserialize)]
#[allow(non_snake_case)]
pub struct Expantion{
    pub name: String,
    pub series: String,
    pub tcgName: String,
    pub numberOfCards: i64,
    pub releaseDate: String,
    pub logoURL: String,
    pub symbolURL: String,
}

#[derive(Serialize)]
#[derive(Deserialize)]
#[allow(non_snake_case)]
pub struct Series{
    pub name: String,
    pub icon: String,
    pub releaseDate: String,
}

#[derive(Deserialize)]
#[derive(Serialize)]
#[allow(non_snake_case)]
pub struct Price{
    pub date: String,
    pub cardId: String,
    pub variant: String,
    pub vendor: String,
    pub price: f64,
}

#[allow(non_snake_case)]
#[derive(Serialize)]
#[derive(Deserialize)]
pub struct SealedProduct {
    pub name: String,
    pub idTCGP: i64,
    pub expIdTCGP: String,
    pub price: f64,
    pub expName: String,
    pub productType: String,
    pub img: String,
    pub tags: Option<Vec<String>>,
    pub paid: Option<f64>,
    pub count: Option<i64>,
}