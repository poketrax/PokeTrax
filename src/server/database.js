const { app } = require("electron");
const compver = require("compare-version");
const Database = require("better-sqlite3");
const fetch = require("node-fetch");
const fs = require("fs");
const hash = require("object-hash");
const https = require("follow-redirects").https;
const { parse } = require("json2csv");
const path = require("path");

const { pwd } = require("./utils");

const DB_META = "./sql/meta.json";
const CARD_DB_FILE = "./sql/data.sqlite3";
const PRICE_DB_FILE = "./sql/prices.sqlite3";
const COLLECTION_DB_FILE = "./sql/collections.sqlite3";

/**
 * Prices database close when done
 * @returns {Database}
 */
const pricesDB = () => {
    return new Database(path.join(pwd(), PRICE_DB_FILE));
};
/**
 * Card database close when done
 * @returns {Database}
 */
const cardDB = () => {
    return new Database(path.join(pwd(), CARD_DB_FILE));
};
/**
 * Collection database close when done
 * @returns {Database}
 */
const collectionDB = () => {
    return new Database(path.join(pwd(), COLLECTION_DB_FILE));
};

/**
 * @type {{ready: boolean, updated: boolean, error?: any, newSoftware?: boolean}}
 */
let dbUpdate = { ready: false, updated: false };

//Check for card Updates
const dbStatus = () => {
    return dbUpdate;
};

const checkForDbUpdate = async () => {
    try {
        //search for folder
        if (fs.existsSync(path.join(pwd(), "./sql")) === false) {
            fs.mkdirSync(path.join(pwd(), "./sql"), { recursive: true });
        }
        console.log(`database: ${path.join(pwd(), "./sql")}`);
        //Init databases
        const meta = await pullDbMeta();
        const newSoftware = await checkForSoftwareUpdate();
        //if new and no meta file exists
        if (fs.existsSync(path.join(pwd(), DB_META)) === false) {
            dbUpdate = {
                ready: false,
                updated: true,
                newSoftware,
            };
            try {
                await pullDb(meta);
            } catch (err) {
                dbUpdate = {
                    ready: false,
                    updated: false,
                    error: err,
                    newSoftware,
                };
            }
        } else {
            // look for update
            await updateCollections();
            const current = JSON.parse(
                fs.readFileSync(path.join(pwd(), DB_META), {
                    encoding: "utf8",
                    flag: "r",
                })
            );
            if (compver(meta.version, current.version) > 0) {
                dbUpdate = {
                    ready: false,
                    updated: true,
                    newSoftware,
                };
                try {
                    await pullDb(meta);
                } catch (err) {
                    dbUpdate = {
                        ready: false,
                        updated: false,
                        error: err,
                        newSoftware,
                    };
                }
            } else {
                dbUpdate = {
                    ready: true,
                    updated: false,
                    newSoftware,
                };
            }
        }
    } catch (err) {
        dbUpdate = {
            ready: false,
            updated: false,
            error: err,
        };
    }
};

async function checkForSoftwareUpdate() {
    try {
        const currentVerion =
            process.env.NODE_ENV === "test" ||
            process.env.NODE_ENV === "development"
                ? "1.0.0"
                : app.getVersion();
        const release = await fetch(
            "https://api.github.com/repos/poketrax/poketrax/releases/latest"
        ).then((res) => res.json());
        const latestVersion = release.name
            .replace("v", "")
            .replace("-beta", "");
        return compver(currentVerion, latestVersion) < 0 ? true : false;
    } catch (err) {
        console.log(err);
        return false;
    }
}

async function updateCollections() {
    let cdb = collectionDB();
    // @TODO: We should be able to consolidate this to one SQL query...
    let collections = cdb.prepare(`SELECT name from collections`).all() ?? [];
    if (collections.length === 0) {
        return collections;
    }
    const updates = [];
    let carddb = cardDB();
    try {
        for (let collection of collections) {
            let cards =
                cdb
                    .prepare(
                        `SELECT cardId FROM collectionCards WHERE collection = $collection`
                    )
                    .all({ collection: collection.name }) ?? [];
            for (let cardC of cards) {
                let card = carddb
                    .prepare(`SELECT * FROM cards WHERE cardId = $cardId`)
                    .get({ cardId: cardC.cardId });
                updates.push(getTcgpPrice(card));
            }
        }
        await Promise.all(updates);
    } catch (err) {
        console.error(`Error updating card prices: `, err);
    }
    [cdb, carddb].forEach((db) => db.close());
}

//pull release info from database repo
async function pullDbMeta() {
    let release = await fetch(
        "https://api.github.com/repos/poketrax/pokepull/releases/latest"
    ).then((res) => res.json());
    const asset = release.assets.find((value) => value.name === "data.sqlite3");
    return {
        version: release.name,
        asset: asset.browser_download_url,
    };
}

//Pull new database file and reinitialize database
async function pullDb(meta) {
    return new Promise(async (resolve, reject) => {
        https.get(meta.asset, (stream) => {
            //write database file
            let writer = fs.createWriteStream(path.join(pwd(), CARD_DB_FILE));
            stream.pipe(writer);
            writer.on("finish", () => {
                fs.writeFileSync(
                    path.join(pwd(), "./sql/meta.json"),
                    JSON.stringify(meta)
                );
                dbUpdate = { ready: true, updated: true };
                resolve();
            });
            writer.on("error", () => {
                console.log("ERROR");
                reject();
            });
        });
    });
}

function addPrice(db, price) {
    let sql = `INSERT OR IGNORE INTO prices  
                    (id, date, cardId, variant, vendor, price) 
                    VALUES ($id, $date, $cardId, $variant, $vendor, $price)`;
    db.prepare(sql).run({
        id: hash(price.date + price.cardId + price.variant + "tcgp"),
        date: price.date,
        cardId: price.cardId,
        variant: price.variant,
        vendor: price.vendor,
        price: price.price,
    });
}

/**
 * Return TCGPrice
 * @param {Card} card
 * @returns An array of TCGPlayer prices.
 */
async function getTcgpPrice(card) {
    const db = pricesDB();
    const data = await fetch(
        `https://infinite-api.tcgplayer.com/price/history/${card.idTCGP}?range=quarter`
    ).then((res) => res.json());
    const prices = [];
    if (data.count === 0) {
        for (let variant of JSON.parse(card.variants)) {
            let price = {
                date: new Date(Date.now()).toISOString(),
                cardId: card.cardId,
                variant: variant,
                vendor: "tcgp",
                price: 0.0,
            };
            prices.push(price);
            addPrice(db, price);
        }
        return prices;
    }
    for (let result of data.result) {
        // @TODO: luxon
        let date = new Date(Date.parse(result.date));
        for (let variant of result.variants) {
            let price = {
                date: date.toISOString(),
                cardId: card.cardId,
                variant: variant.variant,
                vendor: "tcgp",
                price: parseFloat(variant.marketPrice),
            };
            prices.push(price);
            addPrice(db, price);
        }
    }
    return prices;
}

function addPriceProduct(db, price) {
    let sql = `INSERT OR IGNORE INTO productPrices  
                    (id, date, name, vendor, price) 
                    VALUES ($id, $date, $name, $vendor, $price)`;
    db.prepare(sql).run({
        id: hash(price.date + price.name + price.vendor),
        date: price.date,
        name: price.name,
        vendor: price.vendor,
        price: price.price,
    });
}

/**
 * Return TCGPrice
 * @param {Card} product
 * @returns Product prices.
 */
async function getTcgpPriceProduct(product) {
    const db = pricesDB();
    const data = await fetch(
        `https://infinite-api.tcgplayer.com/price/history/${product.idTCGP}?range=month`
    ).then((res) => res.json());
    let prices = [];
    if (data.count === 0) {
        let price = {
            date: new Date(Date.now()).toISOString(),
            name: product.name,
            vendor: "tcgp",
            price: 0.0,
        };
        prices.push(price);
        addPriceProduct(db, price);
        return prices;
    }
    for (let result of data.result) {
        let date = new Date(Date.parse(result.date));
        for (let variant of result.variants) {
            let price = {
                date: date.toISOString(),
                name: product.name,
                vendor: "tcgp",
                price: parseFloat(variant.marketPrice),
            };
            prices.push(price);
            addPriceProduct(db, price);
        }
    }
    return prices;
}

/**
 * Get prices from database
 * @param {Card} card
 * @param {number} _start
 * @param {number} _end
 * @returns
 */
const getPrices = async (card, _start, _end) => {
    // @TODO: luxon
    let yesterday = new Date(Date.now());
    yesterday.setDate(yesterday.getDate() - 2);
    let timeFilter = ``;
    let limit = ``;
    if (_start != null && _end != null) {
        timeFilter = `AND dateTime(date) > dateTime($start) AND dateTime(date) < dateTime($end)`;
    } else {
        limit = "LIMIT 1";
    }
    let sql = `SELECT date(date) as date, cardId, variant, vendor, price FROM prices WHERE cardId = $cardId ${timeFilter} ORDER BY dateTime(date) DESC ${limit}`;
    let db = pricesDB();
    try {
        let rows = db
            .prepare(sql)
            .all({ cardId: card.cardId, start: _start, end: _end });
        db.close();
        if (rows.length < 10 || rows[0].date < yesterday.getTime()) {
            return await getTcgpPrice(card);
        } else {
            return rows;
        }
    } catch (err) {
        db.close();
        return Promise.reject(err);
    }
};

/**
 * Returns the product prices for a given range or the latest price if no range is provided
 * @param {SealedProdcut} product
 * @param {string} _start
 * @param {string} _end
 * @returns
 */
const getProductPrice = async (product, _start, _end) => {
    // @TODO: luxon
    let yesterday = new Date(Date.now());
    yesterday.setDate(yesterday.getDate() - 2);
    let timeFilter = ``;
    let limit = ``;
    if (_start != null && _end != null) {
        timeFilter = `AND dateTime(date) > dateTime($start) AND dateTime(date) < dateTime($end)`;
    } else {
        limit = "LIMIT 1";
    }
    let sql = `SELECT name, date(date) as date, vendor, price FROM productPrices WHERE name = $name ${timeFilter} ORDER BY datetime(date) DESC ${limit}`;
    let db = pricesDB();
    try {
        let rows = db
            .prepare(sql)
            .all({ name: product.name, start: _start, end: _end });
        db.close();
        if (rows.length === 0 || rows[0].date < yesterday.getTime()) {
            return await getTcgpPriceProduct(product);
        } else {
            return rows;
        }
    } catch (err) {
        db.close();
        Promise.reject(err);
    }
};

/**
 *
 * @param {string} collection
 * @returns {string} output
 */
const getCollectionDownload = (collection, type) => {
    let db = collectionDB();
    let sqlAttach = `ATTACH DATABASE '${path.join(
        pwd(),
        CARD_DB_FILE
    )}' AS cardDB;`;
    let sql =
        `SELECT * FROM collectionCards colCards INNER JOIN cardDB.cards cards ON cards.cardId = colCards.cardId ` +
        `WHERE colCards.collection = '${collection}'`;
    db.prepare(sqlAttach).run();
    let cards = db.prepare(sql).all();
    db.close();
    switch (type) {
        case "JSON":
            return JSON.stringify(cards, null, 1);
        case "CSV":
            const opts = {
                fields: [
                    "name",
                    "expName",
                    "expCardNumber",
                    "rarity",
                    "energyType",
                    "cardType",
                    "pokedex",
                    "variant",
                    "grade",
                    "paid",
                    "count",
                ],
            };
            return parse(cards, opts);
        case "txt-TCGP":
            return cards
                .map(
                    (card) => `${card.count} ${card.name} [${card.expCodeTCGP}]`
                )
                .join("\n");
        default:
            throw Error(`Unknown export type: ${type}`);
    }
};

/**
 * Removes old time format.
 * @deprecated can be removed @ v1
 * @param {*} prices
 */
function upgradePrices(prices) {
    let oldprices = prices
        .prepare(`SELECT * FROM prices where dateTime(date) is null`)
        .all();
    for (let price of oldprices) {
        let date = new Date(price.date);
        prices
            .prepare(`UPDATE prices SET date = $date`)
            .run({ date: date.toISOString() });
    }
}

const init = () => {
    try {
        let prices = pricesDB();
        prices
            .prepare(
                `CREATE TABLE IF NOT EXISTS prices (id TEXT UNIQUE, date TEXT, cardId TEXT, variant TEXT, vendor TEXT, price REAL)`
            )
            .run();
        prices
            .prepare(
                `CREATE TABLE IF NOT EXISTS productPrices (id TEXT UNIQUE, date TEXT, name TEXT, vendor TEXT, price REAL)`
            )
            .run();
        prices.close();
        let collections = collectionDB();
        collections
            .prepare(
                `CREATE TABLE IF NOT EXISTS collections (name TEXT UNIQUE, img TEXT)`
            )
            .run();
        collections
            .prepare(
                `CREATE TABLE IF NOT EXISTS collectionCards (cardId TEXT, collection TEXT, variant TEXT, paid REAL, count INTEGER, grade TEXT)`
            )
            .run();
        collections
            .prepare(
                `CREATE TABLE IF NOT EXISTS collectionProducts (name TEXT, collection TEXT, paid REAL, count INTEGER)`
            )
            .run();
        collections.close();
    } catch (err) {
        console.error(err);
    }
};

module.exports.getCollectionDownload = getCollectionDownload;
module.exports.dbStatus = dbStatus;
module.exports.init = init;
module.exports.pricesDB = pricesDB;
module.exports.collectionDB = collectionDB;
module.exports.cardDB = cardDB;
module.exports.checkForDbUpdate = checkForDbUpdate;
module.exports.getProductPrice = getProductPrice;
module.exports.getPrices = getPrices;
module.exports.CARD_DB_FILE = CARD_DB_FILE;
module.exports.COLLECTION_DB_FILE = COLLECTION_DB_FILE;
module.exports.PRICE_DB_FILE = PRICE_DB_FILE;
