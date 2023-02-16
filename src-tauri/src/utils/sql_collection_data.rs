/// This Module is used interact with the collections database file.
use crate::models::pokemon::Card;
use crate::routes::collections::Tag;
use crate::utils::sql_pokemon_data::POKE_DB_PATH;
use crate::utils::shared::{get_data_dir, in_list, json_list_value};
use lazy_static::lazy_static;
use rusqlite::{Connection, Result};
use serde_json;

static ADD_TABLE_CARD_COLLECTION: &str = "CREATE TABLE IF NOT EXISTS collectionCards (cardId TEXT, tags TEXT, variant TEXT, paid REAL, count INTEGER, grade TEXT)";
static ADD_TABLE_PRODUCT_COLLECTION: &str = "CREATE TABLE IF NOT EXISTS collectionProducts (name TEXT, tags TEXT, paid REAL, count INTEGER)";
static ADD_COLLECTION_TABLE: &str = "CREATE TABLE IF NOT EXISTS collections (name TEXT, color TEXT)";

lazy_static! {
    pub static ref POKE_COLLECTION_DB_PATH: String =
        format!("{}{}", get_data_dir(), "/collections.sql");
}
/// Initializes the Collection database if it doesn't exists
pub fn initialize_data() {
    log::info!("Creating collection tables");
    let connection = Connection::open(POKE_COLLECTION_DB_PATH.as_str()).unwrap();
    connection.execute(ADD_TABLE_CARD_COLLECTION, []).unwrap();
    connection.execute(ADD_TABLE_PRODUCT_COLLECTION, []).unwrap();
    connection.execute(ADD_COLLECTION_TABLE, []).unwrap();
}

/// Get all Tags for collections 
pub fn get_tags() -> Result<Vec<Tag>, Box<dyn std::error::Error>> {
    let connection = Connection::open(POKE_COLLECTION_DB_PATH.as_str())?;
    let mut query =connection.prepare("SELECT name, color FROM collections")?;
    let mut collections: Vec<Tag> = Vec::new();
    let rows = query.query_map([], |row| {
        Ok(Tag {
            name : row.get(0)?,
            color: row.get(1)?
        })
    })?;
    for row in rows {
        collections.push(row?);
    }
    Ok(collections)
}

/// Add a tag
/// # Arguments
///    * 'collection' - add a tag to the database
pub fn add_tag(collection: Tag) -> Result<(), Box<dyn std::error::Error>> {
    let connection = Connection::open(POKE_COLLECTION_DB_PATH.as_str())?;
    let statement = "INSERT INTO collections (name, color) VALUES (?1, ?2)";
    connection.execute(statement, &[&collection.name, &collection.color])?;
    Ok(())
}

/// Delete a tag and remove it from any cards in collection
/// # Arguments
///    * 'collection' - remove this tag and remove the tag from all cards with this tag
pub fn delete_tag(collection: Tag) -> Result<(), Box<dyn std::error::Error>> {
    let connection = Connection::open(POKE_COLLECTION_DB_PATH.as_str()).unwrap();
    let tags = format!("[\"{}\"]", collection.name);
    //Find records with collection
    let number_of_cards = search_card_collection_count(None, None, None, Some(tags.clone()))?;
    let cards = search_card_collection(0, None, None, None, Some(tags), None, Some(number_of_cards))?;
    for mut card in cards {
        if card.tags.is_some() {
            let tags_vec = card.tags.unwrap();
            let mut new_tags: Vec<String> = Vec::new();
            for tag in tags_vec { 
                if tag.eq(&collection.name) == false {new_tags.push(tag)}
            }
            card.tags = Some(new_tags);
            upsert_card(&card)?;
        }
    }
    let statement = "DELETE FROM collections WHERE name = ?1";
    connection.execute(statement, &[&collection.name])?;
    Ok(())
}

/// Upsert a card into the collection database
/// # Argument
///    * 'card' - Card to upsert
pub fn upsert_card(card: &Card) -> Result<(), Box<dyn std::error::Error>> {
    let connection = Connection::open(POKE_COLLECTION_DB_PATH.as_str())?;
    let tags: String;
    let grade: String;
    let variant: String;

    match serde_json::to_string(&card.tags) {
        Ok(val) => tags = val,
        Err(_) => return Err(Box::from("Failed to parse tags as array or was null")),
    }
    grade = card.grade.clone().unwrap_or_default();
    if card.variant.is_none() {
        return Err(Box::from("Variant was null"));
    }
    variant = card.variant.clone().unwrap();

    let mut statement = connection.prepare(
        "SELECT * from collectionCards 
                WHERE cardId = ?1 
                AND variant = ?2 
                AND grade = ?3",
    )?;
    let found = statement.exists(&[card.cardId.as_str(), variant.as_str(), grade.as_str()])?;
    log::debug!("upsert card found: {}", found);
    if found {
        let update = connection.execute(
            "UPDATE collectionCards 
            SET tags = ?1, paid = ?2, count = ?3
            WHERE cardId = ?4 AND variant = ?5 AND grade = ?6",
            &[
                tags.as_str(),
                card.paid.unwrap().to_string().as_str(),
                card.count.unwrap().to_string().as_str(),
                card.cardId.as_str(),
                variant.as_str(),
                grade.as_str(),
            ],
        );
        match update {
            Ok(_) => return Ok(()),
            Err(e) => return Err(Box::from(e)),
        }
    } else {
        let insert = connection.execute(
            "INSERT INTO collectionCards 
            (cardId, tags, variant, paid, count, grade)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            &[
                card.cardId.as_str(),
                tags.as_str(),
                variant.as_str(),
                card.paid.unwrap_or_default().to_string().as_str(),
                card.count.unwrap().to_string().as_str(),
                grade.as_str(),
            ],
        );
        match insert {
            Ok(_) => return Ok(()),
            Err(e) => return Err(Box::from(e)),
        }
    }
}

/// Delete card from collection database
/// # Argument
///    * 'card' - card to delete
pub fn delete_card(card: Card) -> Result<(), Box<dyn std::error::Error>> {
    let connection = Connection::open(POKE_COLLECTION_DB_PATH.as_str()).unwrap();
    let variant = card.variant.unwrap();
    let grade = card.grade.unwrap();
    let mut search = connection
        .prepare(
            "SELECT * from collectionCards 
            WHERE cardId = ?1
            AND variant = ?2
            AND grade = ?3",
        )
        .unwrap();
    let _row = search.query_row(
        &[card.cardId.as_str(), variant.as_str(), grade.as_str()],
        |_| Ok(true),
    );

    let found: bool;
    match _row {
        Ok(val) => found = val,
        Err(e) => return Err(Box::from(e)),
    }
    if found {
        let delete = connection.execute(
            "DELETE FROM collectionCards 
            WHERE cardId = ?1
            AND variant = ?2
            AND grade = ?3",
            &[card.cardId.as_str(), variant.as_str(), grade.as_str()],
        );
        match delete {
            Ok(_) => return Ok(()),
            Err(e) => Err(Box::from(e)),
        }
    } else {
        Err(Box::from("No Card Found"))
    }
}

/// Search for cards in the collection
/// #Argumnet
///    * 'name_filter' - search term for cards in collection
///    * 'exp_filter' - list of the expantion to include (urlencoded json array)
///    * 'rare_filter' - list of the rarities to include (urlencoded json array)
///    * 'tag_filter' - list of the tags to include (urlencoded json array)
pub fn search_card_collection_count(
    name_filter: Option<String>,
    exp_filter: Option<String>,
    rare_filter: Option<String>,
    tag_filter: Option<String>
) -> Result<i64, Box<dyn std::error::Error>> {
    let connection = Connection::open(POKE_COLLECTION_DB_PATH.as_str()).unwrap();

    let attach = format!("ATTACH DATABASE '{}' AS cardDB", POKE_DB_PATH.as_str());
    connection.execute(attach.as_str(), [])?;

    let mut search_term = String::from("");
    if name_filter.is_some() {
        search_term = name_filter.unwrap();
    }

    let query_sql = format!(
        "SELECT _collection.cardId
        FROM collectionCards _collection
        INNER JOIN cardDB.cards _cards ON _collection.cardId = _cards.cardId
        WHERE _collection.cardId like '%{}%'
        {} {} {}",
        search_term,
        in_list(String::from("_cards.expName"), &exp_filter),
        in_list(String::from("_cards.rarity"), &rare_filter),
        json_list_value(String::from("_collection.tags"), tag_filter),
    );

    let statement = format!("SELECT count(cardID) as count FROM ({})",&query_sql);
    let row = connection.query_row(&statement, [], |row| Ok(row.get(0)))?;
    match row {
        Ok(val) => return Ok(val),
        Err(e) => Err(Box::from(e)),
    }
}

/// Search for cards in the collection
/// #Argumnet
///    * 'page' - page number of the query (pages are currently 25 elements long)
///    * 'name_filter' - search term for the name of the card
///    * 'exp_filter' - list of the expantion to include (urlencoded json array)
///    * 'rare_filter' - list of the rarities to include (urlencoded json array)
///    * 'tag_filter' - list of the tags to include (urlencoded json array)
///    * 'sort' - ORDER BY statement for sorting results
///    * 'limit' - sql limit for the query
pub fn search_card_collection(
    page: u32,
    name_filter: Option<String>,
    exp_filter: Option<String>,
    rare_filter: Option<String>,
    tag_filter: Option<String>,
    sort: Option<String>,
    limit: Option<i64>
) -> Result<Vec<Card>, Box<dyn std::error::Error>> {
    let limit_str: String;
    let offset: String;
    if limit.is_none() {
        limit_str = 25.to_string();
        offset = (page.to_owned() * 25).to_string();
    }else{
        let lim = limit.unwrap();
        limit_str = lim.to_string();
        offset = (i64::from(page.to_owned()) * lim).to_string();
    }
    let mut _cards: Vec<Card> = Vec::new();

    let connection = Connection::open(POKE_COLLECTION_DB_PATH.as_str()).unwrap();
    let attach = format!("ATTACH DATABASE '{}' AS cardDB", POKE_DB_PATH.as_str());
    log::debug!("attach : {}", attach);
    connection.execute(attach.as_str(), [])?;
    
    let _name_filter = format!("%{}%",name_filter.unwrap_or_default().as_str());
    let query_sql = format!(
        "SELECT _collection.cardId, _collection.tags, _collection.variant,
        _collection.paid, _collection.grade, _collection.count,
        _cards.name, _cards.expName, _cards.expCardNumber, _cards.expCodeTCGP,
        _cards.expIdTCGP, _cards.rarity, _cards.cardType, _cards.energyType, 
        _cards.variants, _cards.pokedex, _cards.releaseDate, _cards.img,
        _cards.idTCGP, _cards.price
        FROM collectionCards _collection
        INNER JOIN cardDB.cards _cards ON _collection.cardId = _cards.cardId
        WHERE _collection.cardId like ?1
        {} {} {} {}
        LIMIT {} OFFSET {}",
        in_list(String::from("_cards.expName"), &exp_filter),
        in_list(String::from("_cards.rarity"), &rare_filter),
        json_list_value(String::from("_collection.tags"), tag_filter),
        sort.unwrap_or_default().as_str(),
        &limit_str,
        &offset
    );
    //Query page
    log::debug!("collect card search sql: {}",query_sql);
    let mut query = connection.prepare(query_sql.as_str())?;
    let rows = query
        .query_map([&_name_filter], |row| {
            let variants_str: String = row.get(14).unwrap_or_default();
            let variants: Vec<String> = serde_json::from_str(variants_str.as_str())
                .expect("Failed to parse varriants Array");
            let tags_str: String = row.get(1).unwrap_or_default();
            let tags: Vec<String> =
                serde_json::from_str(tags_str.as_str()).expect("Failed to parse tags Array");
            Ok(Card {
                cardId: row.get(0).unwrap_or_default(),
                tags: Some(tags),
                variant: Some(row.get(2).unwrap_or_default()),
                paid: Some(row.get(3).unwrap_or_default()),
                grade: Some(row.get(4).unwrap_or_default()),
                count: Some(row.get(5).unwrap_or_default()),

                name: row.get(6).unwrap_or_default(),
                expName: row.get(7).unwrap_or_default(),
                expCardNumber: row.get(8).unwrap_or_default(),
                expCodeTCGP: row.get(9).unwrap_or_default(),

                expIdTCGP: row.get(10).unwrap_or_default(),
                rarity: row.get(11).unwrap_or_default(),
                cardType: row.get(12).unwrap_or_default(),
                energyType: row.get(13).unwrap_or_default(),

                variants: variants,
                pokedex: row.get(15).unwrap_or_default(),
                releaseDate: row.get(16).unwrap_or_default(),
                img: row.get(17).unwrap_or_default(),

                idTCGP: row.get(18).unwrap_or_default(),
                price: row.get(19).unwrap_or_default(),
            })
        })
        .expect("SQL query failed");
    for row in rows {
        _cards.push(row?)
    }
    Ok(_cards)
}
#[cfg(test)]
mod collection_tests {
    use super::{*, add_tag};
    use crate::models::pokemon::Card;
    use log::LevelFilter;
    use simple_logger::SimpleLogger;

    fn card(tags: Vec<String>, card_id: String) -> Card {
        return Card {
            cardId: card_id,
            tags: Some(tags),
            variant: Some(String::from("variant")),
            paid: Some(1.0),
            grade: Some(String::from("BLAM")),
            count: Some(1),

            name: String::from("name"),
            expName: String::from("name"),
            expCardNumber: String::from("name"),
            expCodeTCGP: String::from("name"),

            expIdTCGP: String::from("name"),
            rarity: String::from("not name"),
            cardType: String::from("name"),
            energyType: String::from("name"),

            variants: Vec::from([String::from("rare")]),
            pokedex: 0,
            releaseDate: String::from("name"),
            img: String::from("name"),

            idTCGP: 12345,
            price: 0.0,
        };
    }

    #[test]
    fn test_init() {
        SimpleLogger::new()
            .with_level(LevelFilter::Debug)
            .init()
            .unwrap();
        initialize_data()
    }

    #[test]
    fn test_add_del_card_collection() {
        add_card_collection();
        del_card_collection();
    }

    fn add_card_collection() {
        let tags = Vec::from([String::from("col1")]);
        let tags2 = Vec::from([String::from("col2")]);
        let tags3: Vec<String> = Vec::new();
        let card1 = card(
            tags,
            String::from("SWSH11-Lost-Origin-Aerodactyl-VSTAR-093"),
        );
        let card2 = card(tags2, String::from("Pokemon-GO-Charizard-010"));
        let card3 = card(tags3, String::from("Pokemon-GO-Blastoise-017"));
        upsert_card(&card2).unwrap();
        upsert_card(&card3).unwrap();
        match upsert_card(&card1) {
            Ok(_) => assert!(true),
            Err(e) => {
                println!("{}", e);
                assert!(false)
            }
        }
    }

    fn del_card_collection() {
        let tags = Vec::from([String::from("col1")]);
        let tags2 = Vec::from([String::from("col2")]);
        let tags3: Vec<String> = Vec::new();
        let card1 = card(
            tags,
            String::from("SWSH11-Lost-Origin-Aerodactyl-VSTAR-093"),
        );
        let card2 = card(tags2, String::from("Pokemon-GO-Charizard-010"));
        let card3 = card(tags3, String::from("Pokemon-GO-Blastoise-017"));
        delete_card(card2).unwrap();
        delete_card(card3).unwrap();
        match delete_card(card1) {
            Ok(_) => assert!(true),
            Err(e) => {
                println!("{}", e);
                assert!(false)
            }
        }
    }

    #[test]
    fn test_add_tag() {
        let tag = Tag{
            name: String::from("col1"), color: String::from("red")
        };
        match add_tag(tag) {
            Ok(_) => assert!(true),
            Err(e) => {
                println!("{}", e);
                assert!(false)
            }
        }
    }

    #[test]
    fn test_delete_tag() {
        let tag = Tag{
            name: String::from("col1"), color: String::from("red")
        };
        match delete_tag(tag) {
            Ok(_) => assert!(true),
            Err(e) => {
                println!("{}", e);
                assert!(false)
            }
        }
    }

    #[test]
    fn search_card_collection_test() {
        match search_card_collection(0, None, None, None, Some(String::from("[\"col2\",\"col1\"]")), None, None) {
            Ok(val) => {
                log::debug!("{}", serde_json::to_string_pretty(&val).unwrap());
                assert!(true)
            }
            Err(e) => {
                println!("{}", e);
                assert!(false)
            }
        }
    }
}
