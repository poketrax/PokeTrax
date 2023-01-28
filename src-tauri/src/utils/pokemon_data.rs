/// This file pretains to all Pokemon database interactions and meta data for the database
use crate::models::pokemon::{Card, Expantion, SealedProduct, Series};
use crate::utils::shared::{get_data_dir, get_admin_file_path, update_admin_file_path};
use rusqlite::{Connection, Result, named_params};
use lazy_static::lazy_static;
use super::shared::in_list;

lazy_static! {
    pub static ref POKE_DB_PATH: String = format!("{}{}", get_data_dir(), "/data.sql");
}

/* ---------------------------------------------------------
  EXPANTIONS
--------------------------------------------------------- */

/// Get expantion via its name
/// # Arguments
///    * 'name' - name of the expantion to retrieve
///    * 'db_path' - path to sqlite database defaults to POKE_DB_PATH
pub fn get_expansion(
    name: String,
    db_path: Option<String>,
) -> Result<Expantion, Box<dyn std::error::Error>> {
    let connection: Connection;
    if db_path.is_none() {
        connection = Connection::open(POKE_DB_PATH.as_str())?;
    } else {
        connection = Connection::open(db_path.unwrap_or_default().as_str())?;
    }
    let _name = urlencoding::decode(name.as_str())
        .expect("UTF-8")
        .to_string();
    let statement = String::from(
        "SELECT name, series, tcgName, numberOfCards,
        releaseDate, logoURL, SymbolURL 
        FROM expansions 
        WHERE name = :name",
    );
    println!("Exp Name {}", _name);
    let mut query = connection.prepare(&statement)?;
    let rows = query.query_map(&[(":name", &_name)],
     |row| {
        let exp: Expantion;
        exp = Expantion {
            name: row.get(0)?,
            series: row.get(1)?,
            tcgName: row.get(2)?,
            numberOfCards: row.get(3)?,
            releaseDate: row.get(4)?,
            logoURL: row.get(5)?,
            symbolURL: row.get(6)?,
        };
        Ok(exp)
    })?;
    for row in rows {
        match row {
            Ok(val) => return Ok(val),
            Err(e) => return Err(Box::from(e)),
        }
    }
    Err(Box::from("Expantion not found"))
}

/// Get All Expantions
/// # Arguments
///    * 'db_path' - path to sqlite database defaults to POKE_DB_PATH
pub fn get_expansions(
    db_path: Option<String>
) -> Result<Vec<Expantion>, Box<dyn std::error::Error>> {
    let connection: Connection;
    if db_path.is_none() {
        connection = Connection::open(POKE_DB_PATH.as_str())?;
    } else {
        connection = Connection::open(db_path.unwrap_or_default().as_str())?;
    }
    let mut _expansions: Vec<Expantion> = Vec::new();
    let mut statement = connection
        .prepare("SELECT name, series, tcgName, numberOfCards, releaseDate, logoURL, SymbolURL FROM expansions")?;
    let rows = statement
        .query_map([], |row| {
            let exp: Expantion;
            exp = Expantion {
                name: row.get(0)?,
                series: row.get(1)?,
                tcgName: row.get(2)?,
                numberOfCards: row.get(3)?,
                releaseDate: row.get(4).unwrap_or_default(),
                logoURL: row.get(5)?,
                symbolURL: row.get(6)?,
            };
            Ok(exp)
        })
        .unwrap();
    for row in rows {
        match row {
            Ok(val) => _expansions.push(val),
            Err(e) => return Err(Box::from(e)),
        }
    }
    Ok(_expansions)
}

/// Upsert Expantion to database
/// * Arguments
///    * exp - expantion to upsert
pub fn upsert_expantion(exp: &Expantion) -> Result<(), Box<dyn std::error::Error>> { 
    let connection: Connection = Connection::open(get_admin_file_path().as_str())?;
    let mut query = connection.prepare("SELECT * FROM expansions WHERE name = :name")?;
    let found = query.exists(named_params!{":name": exp.name})?;
    if found {//UPDATE
        let mut statement = 
        connection.prepare(
            "UPDATE expansions 
            SET releaseDate = :releaseDate,
            series = :series,
            tcgName = :tcgName,
            numberOfCards = :numberOfCards,
            logoURL = :logoURL,
            symbolURL = :symbolURL,
            releaseDate = :releaseDate
            WHERE name = :name")?;
        statement.execute(named_params! {
            ":name": &exp.name,
            ":series": &exp.series,
            ":tcgName": &exp.tcgName,
            ":numberOfCards": &exp.numberOfCards,
            ":logoURL": &exp.logoURL,
            ":symbolURL": &exp.symbolURL,
            ":releaseDate": &exp.releaseDate
        })?;
        Ok(())
    } else { //INSERT
        let mut statement = 
        connection.prepare(
            "INSERT INTO expansions 
                (name, series, tcgName, numberOfCards, logoURL, symbolURL, releaseDate) 
                VALUES (:name, :series, :tcgName, :numberOfCards, :logoURL, :symbolURL, :releaseDate)")?;
        statement.execute(named_params! {
            ":name": &exp.name,
            ":series": &exp.series,
            ":tcgName": &exp.tcgName,
            ":numberOfCards": &exp.numberOfCards,
            ":logoURL": &exp.logoURL,
            ":symbolURL": &exp.symbolURL,
            ":releaseDate": &exp.releaseDate
        })?;
        Ok(())
    }
}

/// Delete Expantion
/// # Arguments
///    * name - name of expantion to delete
pub fn delete_expantion(name: String) -> Result<(), Box<dyn std::error::Error>> {
    let connection = Connection::open(get_admin_file_path())?;
    connection.execute("DELETE FROM expansions WHERE name = :name", named_params!{":name": name})?;
    Ok(())
}

#[cfg(test)]
mod expantion_tests {
    use super::*;
    #[test]
    fn test_expantion_add_remove() {
        update_admin_file_path(String::from("./test-data/data.sql"));
        let mut exp = Expantion {
            name: String::from("TEST_EXP"),
            series: String::from("TEST_SERIES"),
            tcgName: String::from("TCGP_NAME"),
            numberOfCards: 1000,
            releaseDate: String::from("2023-01-18T20:04:45Z"),
            logoURL: String::from("logo.png"),
            symbolURL: String::from("symbol.png")
        };
        //INSERT
        upsert_expantion(&exp).unwrap();
        let found = get_expansion(exp.name.clone(), Some(get_admin_file_path())).unwrap();
        assert!(found.name.eq(&exp.name));
        //UPDATE
        exp.numberOfCards = 2000;
        upsert_expantion(&exp).unwrap();
        let found = get_expansion(exp.name.clone(), Some(get_admin_file_path())).unwrap();
        assert!(found.numberOfCards == exp.numberOfCards);
        delete_expantion(exp.name).unwrap();
    }
}

/* ---------------------------------------------------------
  Series
--------------------------------------------------------- */

/// Get series List
/// # Arguments
///    * 'db_path' : Option<String> path to sqlite database defaults to POKE_DB_PATH
pub fn get_series_list(db_path: Option<String>) -> Result<Vec<Series>, Box<dyn std::error::Error>> {
    let mut _series: Vec<Series> = Vec::new();
    let connection: Connection;
    if db_path.is_none() {
        connection = Connection::open(POKE_DB_PATH.as_str())?;
    } else {
        connection = Connection::open(db_path.unwrap_or_default().as_str())?;
    }
    let mut statement = connection
        .prepare("SELECT name, releaseDate, icon FROM series")
        .unwrap();
    let rows = statement
        .query_map([], |row| {
            Ok(Series {
                name: row.get(0)?,
                releaseDate: row.get(1)?,
                icon: row.get(2)?,
            })
        })
        .unwrap();
    for row in rows {
        match row {
            Ok(val) => _series.push(val),
            Err(e) => return Err(Box::from(e)),
        }
    }
    Ok(_series)
}

/// Get a Series via provided name
/// # Arguments
///    * 'name' - name of the series to retieve
///    * 'db_path' - path to sqlite database defaults to POKE_DB_PATH
pub fn get_series(name: String, db_path: Option<String>) -> Result<Series, Box<dyn std::error::Error>> {
    let connection: Connection;
    if db_path.is_none() {
        connection = Connection::open(POKE_DB_PATH.as_str())?;
    } else {
        connection = Connection::open(db_path.unwrap_or_default().as_str())?;
    }
    let statement = String::from("SELECT name, releaseDate, icon FROM series WHERE name = ?1");
    let mut query = connection.prepare(&statement)?;
    let row = query.query_row([name], |row| {
        Ok(Series {
            name: row.get(0)?,
            releaseDate: row.get(1)?,
            icon: row.get(2)?,
        })
    });
    match row {
        Ok(val) => return Ok(val),
        Err(e) => return Err(Box::from(e)),
    }
}

/// Upsert a series
/// # Arguments
///    * series -  Series to upsert
pub fn upsert_series(series: &Series) -> Result<(), Box<dyn std::error::Error>> {
    let connection = Connection::open(get_admin_file_path())?;
    let mut query = connection.prepare("SELECT * FROM series WHERE name = :name")?;
    let found = query.exists(named_params!{":name": series.name})?;
    if found {
        let mut statement = connection.prepare(
            "UPDATE series SET
            icon = :icon,
            releaseDate = :releaseDate
            WHERE name = :name"
        )?;
        statement.execute(named_params!{
            ":name" : series.name,
            ":icon" : series.icon,
            ":releaseDate" : series.releaseDate
        })?;
    }else{
        let mut statement = connection.prepare(
            "INSERT INTO series
            (name, icon, releaseDate)
            VALUES (:name, :icon, :releaseDate)"
        )?;
        statement.execute(named_params!{
            ":name" : series.name,
            ":icon" : series.icon,
            ":releaseDate" : series.releaseDate
        })?;
    }
    Ok(())
}

/// Delete a series
/// # Arguments
///    * name - name of the series to delete
pub fn delete_series(name: String) -> Result<(), Box<dyn std::error::Error>>{
    let connection = Connection::open(get_admin_file_path())?;
    let mut query = connection.prepare("DELETE FROM series WHERE name = :name")?;
    query.execute(named_params!{":name": name})?;
    Ok(())
}

#[cfg(test)]
mod series_tests {
    use super::*;
    #[test]
    fn test_series_add_remove() {
        update_admin_file_path(String::from("./test-data/data.sql"));
        let mut series = Series {
            name: String::from("TEST_SERIES"),
            icon: String::from("icon.jpg"),
            releaseDate: String::from("2023-01-18T20:04:45Z")
        };
        //insert
        upsert_series(&series).unwrap();
        let found = get_series(series.name.clone(), Some(get_admin_file_path())).unwrap();
        assert!(found.name.eq(&series.name.clone()), "Series not inserted");
        series.icon = String::from("icon.png");
        // update
        upsert_series(&series).unwrap();
        let found = get_series(series.name.clone(), Some(get_admin_file_path())).unwrap();
        assert!(found.icon.eq(&series.icon));
        //delete
        delete_series(series.name).unwrap();
    }
}

/* ---------------------------------------------------------
  Rarities
--------------------------------------------------------- */

/// Get list of rarities
/// # Arguments
///    * 'db_path' - path to sqlite database defaults to POKE_DB_PATH
pub fn get_rarities(db_path: Option<String>) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let mut _rarities: Vec<String> = Vec::new();
    let connection: Connection;
    if db_path.is_none() {
        connection = Connection::open(POKE_DB_PATH.as_str())?;
    } else {
        connection = Connection::open(db_path.unwrap_or_default().as_str())?;
    }
    let mut statement = connection
        .prepare("SELECT DISTINCT rarity FROM cards")
        .unwrap();
    let rows = statement.query_map([], |row| Ok(row.get(0)?)).unwrap();
    for row in rows {
        match row {
            Ok(val) => _rarities.push(val),
            Err(e) => return Err(Box::from(e)),
        }
    }
    Ok(_rarities)
}

/* ---------------------------------------------------------
  Cards
--------------------------------------------------------- */

/// Get the number of cards that match a set of filters
/// # Arguments
///    * 'name_filter' - search term for the name of the card
///    * 'exp_filter' - list of the expantion to include (urlencoded json array)
///    * 'rare_filter - list of the rarities to include (urlencoded json array)
///    * 'db_path' - path to sqlite database defaults to POKE_DB_PATH
pub fn card_count(
    name_filter: &Option<String>,
    exp_filter: &Option<String>,
    rare_filter: &Option<String>,
    db_path: &Option<String>
) -> Result<i64, Box<dyn std::error::Error>> {
    let connection: Connection;
    if db_path.is_none() {
        connection = Connection::open(POKE_DB_PATH.as_str())?;
    } else {
        connection = Connection::open(db_path.to_owned().unwrap_or_default().as_str())?;
    }
    let _name_filter = format!("%{}%", name_filter.to_owned().unwrap_or_default());
    let statement = format!(
        "SELECT count(cardId) as cardCount 
        FROM cards 
        WHERE cardId like ?1 {} {}",
        in_list(String::from("expName"), exp_filter),
        in_list(String::from("rarity"), rare_filter),
    );
    //Determine count
    let mut query = connection.prepare(&statement)?;
    let row = query.query_row([_name_filter], |row| Ok(row.get(0)))?;
    match row {
        Ok(val) => return Ok(val),
        Err(e) => return Err(Box::from(e)),
    }
}

#[cfg(test)]
mod card_count_tests {
    use super::*;
    #[actix_web::test]
    async fn test_count() {
        let name_filter = Some(String::from("Charizard"));
        let exp_filter = Some(String::from(urlencoding::encode("[\"Lost Origin\"]")));
        let rare_filter = Some(String::from(urlencoding::encode("[\"Ultra Rare\"]")));
        let count = card_count(&name_filter, &exp_filter, &rare_filter, &None);
        match count {
            Ok(val) => {
                assert!(val > 0)
            }
            Err(_) => {
                assert!(false)
            }
        }
    }
}

/// Search for cards
/// # Arguments
///    * 'page' - page number of the query (pages are currently 25 elements long)
///    * 'name_filter' - search term for the name of the card
///    * 'exp_filter' - list of the expantion to include (urlencoded json array)
///    * 'rare_filter' - list of the rarities to include (urlencoded json array)
///    * 'sort' - ORDER BY statement for sorting results
///    * 'db_path' - path to sqlite database defaults to POKE_DB_PATH
pub fn card_search_sql(
    page: u32,
    name_filter: Option<String>,
    exp_filter: Option<String>,
    rare_filter: Option<String>,
    sort: Option<String>,
    db_path: Option<String>
) -> Result<Vec<Card>, Box<dyn std::error::Error>> {
    let limit = 25;
    let mut _cards: Vec<Card> = Vec::new();
    let connection: Connection;
    if db_path.is_none() {
        connection = Connection::open(POKE_DB_PATH.as_str())?;
    } else {
        connection = Connection::open(db_path.unwrap_or_default().as_str())?;
    }
    let statement = format!(
        "SELECT name, cardId, idTCGP, 
        expName, expCardNumber, expCodeTCGP, expIdTCGP,
        rarity, cardType, energyType, variants, 
        pokedex, releaseDate, price, img
        FROM cards 
        WHERE cardId like \"%{}%\"
        {} {} {}
        LIMIT {} OFFSET {}",
        &name_filter.unwrap_or_default(),
        in_list(String::from("expName"), &exp_filter),
        in_list(String::from("rarity"), &rare_filter),
        &sort.unwrap_or_default(),
        &format!("{}", limit),
        &format!("{}", (page.to_owned() * limit))
    );
    //Query page
    let mut query = connection.prepare(statement.as_str())?;
    let rows = query.query_map([], |row| {
        let variants_str: String = row.get(10).unwrap_or_default();
        let variants: Vec<String> =
            serde_json::from_str(variants_str.as_str()).expect("JSON parsing error");
        Ok(Card {
            name: row.get(0).unwrap_or_default(),
            cardId: row.get(1).unwrap_or_default(),
            idTCGP: row.get(2).unwrap_or_default(),
            expName: row.get(3).unwrap_or_default(),
            expCardNumber: row.get(4).unwrap_or_default(),
            expCodeTCGP: row.get(5).unwrap_or_default(),
            expIdTCGP: row.get(6).unwrap_or_default(),
            rarity: row.get(7).unwrap_or_default(),
            cardType: row.get(8).unwrap_or_default(),
            energyType: row.get(9).unwrap_or_default(),
            variants: variants,
            pokedex: row.get(11).unwrap_or_default(),
            releaseDate: row.get(12).unwrap_or_default(),
            price: row.get(13).unwrap_or_default(),
            img: row.get(14).unwrap_or_default(),
            tags: None,
            variant: None,
            paid: None,
            count: None,
            grade: None,
        })
    })?;
    for row in rows {
        match row {
            Ok(val) => _cards.push(val),
            Err(e) => return Err(Box::from(e)),
        }
    }
    Ok(_cards)
}

#[cfg(test)]
mod card_search_tests {
    use super::*;
    #[actix_web::test]
    async fn card_search_sql_test() {
        let name_filter = Some(String::from("Charizard"));
        let exp_filter = Some(String::from(urlencoding::encode("[\"Lost Origin\"]")));
        let rare_filter = Some(String::from(urlencoding::encode("[\"Ultra Rare\"]")));
        let count = card_search_sql(0, name_filter, exp_filter, rare_filter, None, None);
        match count {
            Ok(val) => {
                assert!(val.len() > 0)
            }
            Err(_) => {
                assert!(false)
            }
        }
    }
}

/// Get a single card via a name filter
/// # Arguments
///    * 'name_filter' - search term for the name of the card
///    * 'db_path' - path to sqlite database defaults to POKE_DB_PATH
pub fn get_card(name_filter: String, db_path: Option<String>) -> Result<Card, Box<dyn std::error::Error>> {
    let cards;
    match card_search_sql(0, Some(name_filter.clone()), None, None, None, db_path) {
        Ok(val) => cards = val,
        Err(e) => return Err(Box::from(e)),
    }
    if cards.len() < 1 {
        Err(Box::from("No Card Found"))
    } else {
        Ok(cards[0].clone())
    }
}

/// Upsert a single card
/// # Arguments
///    * card - card to upsert
pub fn upsert_card(card: &Card) -> Result<(), Box<dyn std::error::Error>> {
    let connection = Connection::open(get_admin_file_path())?;
    let mut query = connection.prepare("SELECT * FROM cards WHERE cardId = :cardId")?;
    let found = query.exists(named_params!{":cardId": card.cardId})?;
    if found {
        let mut statement = connection.prepare(
            "UPDATE cards SET
             idTCGP = :idTCGP,
             name = :name,
             expIdTCGP = :expIdTCGP,
             expName = :expName,
             expCardNumber = :expCardNumber,
             rarity = :rarity,
             expCodeTCGP = :expCodeTCGP,
             cardType = :cardType,
             energyType = :energyType,
             pokedex = :pokedex,
             releaseDate = :releaseDate,
             description = :description,
             variants = :variants, 
             img = :img
             WHERE cardId = :cardId"
        )?;
        statement.execute(
            named_params!{
                ":cardId": card.cardId,
                ":idTCGP" : card.idTCGP,
                ":name": card.name,
                ":expIdTCGP": card.expIdTCGP,
                ":expName" : card.expName,
                ":expCardNumber": card.expCardNumber,
                ":rarity": card.rarity,
                ":expCodeTCGP": card.expCodeTCGP,
                ":cardType": card.cardType,
                ":energyType": card.energyType,
                ":pokedex": card.pokedex,
                ":releaseDate": card.releaseDate,
                ":variants": serde_json::to_string(&card.variants)?,
                ":img": card.img
            }
        )?;
    }else {
        let mut statement = connection.prepare(
            "INSERT INTO cards
            (cardId, idTCGP, name, expIdTCGP, 
            expCodeTCGP, expName, expCardNumber, rarity, 
            img, price, description, releaseDate,
            energyType, cardType, pokedex, variants)
            VALUES (:cardId, :idTCGP, :name, 
            :expIdTCGP, :expCodeTCGP, :expName,
            :expCardNumber, :rarity, :img, :price,
            :description, :releaseDate, :energyType,
            :cardType, :pokedex, :variants)"
        )?;
        statement.execute(
            named_params!{
                ":cardId": card.cardId,
                ":name" : card.name,
                ":idTCGP" : card.idTCGP,
                ":name": card.name,
                ":expIdTCGP": card.expIdTCGP,
                ":expName" : card.expName,
                ":expCardNumber": card.expCardNumber,
                ":rarity": card.rarity,
                ":expCodeTCGP": card.expCodeTCGP,
                ":cardType": card.cardType,
                ":energyType": card.energyType,
                ":pokedex": card.pokedex,
                ":releaseDate": card.releaseDate,
                ":variants": serde_json::to_string(&card.variants)?,
                ":img": card.img
            }
        )?;
    }
    Ok(())
}

/// Delete Card from admin database
/// #Argmuents
///    * cardId - card id of card to delete
pub fn delete_card(cardId: String) -> Result<(), Box<dyn std::error::Error>> {
    let connection = Connection::open(get_admin_file_path())?;
    let mut statement = connection.prepare("DELETE FROM cards WHERE cardId = :cardId")?;
    statement.execute(named_params!{":cardId": cardId})?;
    Ok(())
}
#[cfg(test)]
mod upsert_card_test {
    use super::*;
    #[test]
    fn test_add_delete() {
        update_admin_file_path(String::from("./test-data/data.sql"));
        let mut card = Card {
            cardId : String::from("TEST_CARD"),
            name: String::from("TEST_CARD"),
            idTCGP: 0,
            expName: String::from("TEST_SET"),
            expCardNumber: String::from("0"),
            expCodeTCGP: String::from("TEST_CARD"),
            rarity: String::from("Rare"),
            cardType: String::from("Trainer"),
            energyType: String::from("Trainer"),
            variants: Vec::from([String::from("Normal")]),
            expIdTCGP: String::from(""),
            pokedex: 100000,
            releaseDate: String::from("2023-01-18T20:04:45Z"),
            price: 0.0,
            img: String::from("img.png"),
            tags: None,
            variant: None,
            paid: None,
            count: None,
            grade: None
        };
        //insert
        let upsert = upsert_card(&card);
        match upsert {
            Ok(_) => assert!(true),
            Err(e) => assert!(false, "Upsert error {}",e)
        }
        let result = get_card(card.name.clone(), Some(get_admin_file_path())).unwrap();
        assert!(result.cardId.eq(&card.cardId));
        card.pokedex = 20000;
        //update
        let upsert = upsert_card(&card);
        match upsert {
            Ok(_) => assert!(true),
            Err(e) => assert!(false, "Upsert error {}",e)
        }
        let result = get_card(card.name, Some(get_admin_file_path())).unwrap();
        assert!(result.pokedex == card.pokedex);
        //delete
        delete_card(card.cardId).unwrap();
    }
}

/* ---------------------------------------------------------
  Products
--------------------------------------------------------- */

/// Get total of sealed products in a given search
/// # Arguments
///    * 'name_filter' - search term for the name of the card
///    * 'db_path' - path to sqlite database defaults to POKE_DB_PATH
pub async fn product_count(name_filter: Option<String>, db_path: Option<String>) -> Result<i64, Box<dyn std::error::Error>> {
    let connection: Connection;
    if db_path.is_none() {
        connection = Connection::open(POKE_DB_PATH.as_str())?;
    } else {
        connection = Connection::open(db_path.unwrap_or_default().as_str())?;
    }
    let _name_filter = format!("%{}%",name_filter.unwrap_or_default());
    let statement = String::from(
        "SELECT count(name) as total 
            FROM cards 
            WHERE cardId like ?1"
    );
    let mut query = connection.prepare(&statement)?;
    //Determine count
    let row = query.query_row([_name_filter], |row| Ok(row.get(0)))?;
    match row {
        Ok(val) => return Ok(val),
        Err(e) => Err(Box::from(e)),
    }
}

#[cfg(test)]
mod product_count_tests {
    use super::*;
    #[actix_web::test]
    async fn product_count_test() {
        let name_filter = Some(String::from("Charizard"));
        let count = product_count(name_filter, None).await;
        match count {
            Ok(val) => {
                assert!(val > 10)
            }
            Err(_) => {
                assert!(false)
            }
        }
    }
}

/// Search for sealed products in the sql database
/// # Arguments
///    * 'page' - page number of the query (pages are currently 25 elements long)
///    * 'name_filter' - search term for the name of the card
///    * 'sort' - ORDER BY statement for sorting results
///    * 'db_path' - path to sqlite database defaults to POKE_DB_PATH
pub async fn product_search_sql(
    page: u32,
    name_filter: Option<String>,
    sort: Option<String>,
    db_path: Option<String>
) -> Result<Vec<SealedProduct>, Box<dyn std::error::Error>> {
    let limit = 25;
    let limit_str = format!("{}", limit);
    let mut products: Vec<SealedProduct> = Vec::new();
    let connection: Connection;
    if db_path.is_none() {
        connection = Connection::open(POKE_DB_PATH.as_str())?;
    } else {
        connection = Connection::open(db_path.unwrap_or_default().as_str())?;
    }
    let _name_filter = format!("%{}%", name_filter.unwrap_or_default());
    let statement = format!(
        "SELECT name, price, idTCGP, expIdTCGP, expName, type, img
        FROM sealed 
        WHERE name LIKE ?1
        {}
        LIMIT {}
        OFFSET {}",
        &sort.unwrap_or_default(),
        &limit_str,
        &format!("{}", (page.to_owned() * limit)),
    );
    //Query page
    let mut query = connection.prepare(&statement)?;
    let rows = query.query_map([_name_filter], |row| {
        let id_tcgp_row : String = row.get(2).unwrap_or_default();
        let id_tcgp_str = id_tcgp_row.replace(".0", "");
        Ok(SealedProduct {
            name: row.get(0).unwrap_or_default(),
            price: row.get(1).unwrap_or_default(),
            idTCGP: id_tcgp_str.parse::<i64>().unwrap_or_default(),
            expIdTCGP: row.get(3).unwrap_or_default(),
            expName: row.get(4).unwrap_or_default(),
            productType: row.get(5).unwrap_or_default(),
            img: row.get(6).unwrap_or_default(),
            collection: None,
            paid: None,
            count: None,
        })
    })?;
    for row in rows {
        match row {
            Ok(val) => products.push(val),
            Err(e) => return Err(Box::from(e)),
        }
    }
    Ok(products)
}

#[cfg(test)]
mod product_tests {
    use super::*;
    use serde_json::to_string_pretty;
    #[actix_web::test]
    async fn get_product_count() {
        let count = product_count(None, None).await;
        match count {
            Ok(val) => {
                assert!(val > 0)
            }
            Err(_) => {
                assert!(false)
            }
        }
    }

    #[actix_web::test]
    async fn get_products() {
        let products = product_search_sql(0, None, None, None).await;
        match products {
            Ok(val) => {
                let msg = to_string_pretty(&val).unwrap();
                print!("{}", msg);
                assert!(val.len() > 0)
            }
            Err(e) => {
                print!("{}", e);
                assert!(false)
            }
        }
    }
}
