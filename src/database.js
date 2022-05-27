const path = require('path')
const { app } = require('electron');
const os = require("os");
const fs = require('fs');
const compver = require('compare-version');
const https = require("follow-redirects").https
const axios = require('axios')
const hash = require('object-hash');
const { parse } = require('json2csv');
const DB_META = "./sql/meta.json"
const CARD_DB_FILE = "./sql/data.sqlite3"
const PRICE_DB_FILE = "./sql/prices.sqlite3"
const COLLECTION_DB_FILE = "./sql/collections.sqlite3"
const Database = require('better-sqlite3');

/* Print the working directory for the application to get date files */
const pwd = () => {
    if (process.env.NODE_ENV === 'development') {
        return "./"
    } else if (process.env.NODE_ENV === 'ci-test') {
        return path.join(process.env.PWD, "/build")
    } else if (process.env.NODE_ENV === 'test') {
        return "./test/data"
    }
    return app.getPath("appData")
}

const appPath = () => {
    if (process.env.NODE_ENV === 'development') {
        return "./"
    } else if (process.env.NODE_ENV === 'ci-test') {
        return path.join(process.env.PWD, "/build")
    } else if (process.env.NODE_ENV === 'test') {
        return "./test/data"
    }
    switch (os.platform()) {
        case 'darwin': return '/Applications/PokeTrax.app/Contents/'
        case 'win32': return ''
        default: return process.env.PWD
    }
}

/**
 * Prices database close when done
 * @returns {Database}
 */
const pricesDB = () => { return new Database(path.join(pwd(), PRICE_DB_FILE)) }
/**
 * Card database close when done
 * @returns {Database}
 */
const cardDB = () => { return new Database(path.join(pwd(), CARD_DB_FILE)) }
/**
 * Collection database close when done
 * @returns {Database}
 */
const collectionDB = () => { return new Database(path.join(pwd(), COLLECTION_DB_FILE)) }

//Check for card Updates
let dbUpdate = { ready: false, updated: false }
const dbStatus = () => {
    return dbUpdate
}

const checkForDbUpdate = () => {
    updateCollections()
    return new Promise(
        async (resolve, reject) => {
            //search for folder
            if (fs.existsSync(path.join(pwd(), "./sql")) === false) {
                fs.mkdirSync(path.join(pwd(), "./sql"))
            }
            //Init databases
            let meta = await pullDbMeta()
            //if new and no meta file exists
            if (fs.existsSync(path.join(pwd(), DB_META)) === false) {
                dbUpdate = { ready: false, updated: true }
                try {
                    await pullDb(meta)
                    resolve()
                } catch (err) {
                    dbUpdate = { ready: false, updated: false, error: err }
                    console.log(err)
                    reject()
                }
            } else { // look for update
                let current = JSON.parse(fs.readFileSync(path.join(pwd(), DB_META), { encoding: 'utf8', flag: 'r' }))
                if (compver(meta.version, current.version) > 0) {
                    dbUpdate = { ready: false, updated: true }
                    try {
                        await pullDb(meta)
                        resolve()
                    } catch (err) {
                        dbUpdate = { ready: false, updated: false, error: err }
                        console.log(err)
                        reject()
                    }
                } else {
                    dbUpdate = { ready: true, updated: false }
                }
            }
        }
    )
}

async function updateCollections() {
    let cdb = collectionDB()
    let collections = cdb.prepare(`SELECT name from collections`).all() ?? []
    for (let colleciton of collections) {
        let cards = cdb.prepare(`SELECT cardId FROM collectionCards WHERE collection = $collection`).all({ collection: colleciton.name }) ?? []
        for (let cardC of cards) {
            let carddb = cardDB()
            let card = carddb.prepare(`SELECT * FROM cards WHERE cardId = $cardId`).get({ cardId: cardC.cardId })
            await getTcgpPrice(card)
            carddb.close()
        }
    }
}

//pull release info from database repo
async function pullDbMeta() {
    return new Promise(
        async (resolve, reject) => {
            try {
                let release = await axios.get('https://api.github.com/repos/jgunzelman88/pokepull/releases/latest')
                let asset = release.data.assets.find((value) => value.name === "data.sqlite3")
                let meta = { 'version': release.data.name, 'asset': asset.browser_download_url }
                resolve(meta)
            } catch (err) {
                reject(err)
            }
        }
    )
}

//Pull new database file and reinitialize database
async function pullDb(meta) {
    return new Promise(
        async (resolve, reject) => {
            https.get(meta.asset, (stream) => {
                //write database file
                let writer = fs.createWriteStream(path.join(pwd(), CARD_DB_FILE))
                stream.pipe(writer)
                writer.on('finish', () => {
                    fs.writeFileSync(path.join(pwd(), "./sql/meta.json"), JSON.stringify(meta))
                    dbUpdate = { ready: true, updated: true }
                    resolve()
                })
                writer.on('error', () => { reject() })
            })
        }
    )
}

/**
 * Return TCGPrice 
 * @param {Card} card 
 * @returns 
 */
function getTcgpPrice(card) {
    console.log("call tcgp")
    let db = pricesDB()
    return new Promise(
        (resolve, reject) => {
            axios.get(`https://infinite-api.tcgplayer.com/price/history/${card.idTCGP}?range=month`).then(
                (res) => {
                    let prices = []
                    if (res.data.count === 0) {
                        resolve(prices)
                    }
                    for (let result of res.data.result) {
                        let date = Date.parse(result.date)
                        for (let variant of result.variants) {
                            let price = {
                                "date": date,
                                "cardId": card.cardId,
                                "variant": variant.variant,
                                "vendor": "tcgp",
                                "price": parseFloat(variant.marketPrice)
                            }
                            prices.push(price)
                            let sql = `INSERT OR IGNORE INTO prices 
                                (id, date, cardId, variant, vendor, price) 
                                VALUES ($id, $date, $cardId, $variant, $vendor, $price)`
                            db.prepare(sql).run({
                                "id": hash(date + card.cardId + variant.variant + "tcgp"),
                                "date": price.date,
                                "cardId": price.cardId,
                                "variant": price.variant,
                                "vendor": price.vendor,
                                "price": price.price
                            })
                        }
                    }
                    resolve(prices)
                }
            ).catch((err) => {
                reject(err)
            }
            )
        }
    )
}

/**
 * Get prices from database
 * @param {Card} card
 * @param {number} _start 
 * @param {number} _end 
 * @returns 
 */
const getPrices = (card, _start, _end) => {
    return new Promise(
        (resolve, reject) => {
            let yesterday = new Date(Date.now())
            yesterday.setDate(yesterday.getDate() - 2)

            let timeFilter = ``
            let limit = ``
            if (_start != null && _end != null) {
                timeFilter = `AND date > $start AND date < $end`
            } else {
                limit = "LIMIT 1"
            }
            let sql = `SELECT * FROM prices WHERE cardId = $cardId ${timeFilter} ORDER BY date DESC ${limit}`
            let db = pricesDB()
            try {
                let rows = db.prepare(sql).all({ "cardId": card.cardId, "start": _start, "end": _end })
                if (rows.length === 0 || rows[0].date < yesterday.getTime()) {
                    getTcgpPrice(card).then(
                        (value) => {
                            resolve(value)
                        }
                    ).catch(
                        (err) => {
                            reject(err)
                        }
                    )
                } else {
                    resolve(rows)
                }
            } catch (err) {
                reject(err)
            } finally {
                db.close()
            }
        }
    )
}

/**
 * 
 * @param {string} collection 
 * @returns {string} output
 */
const getCollectionDownload = (collection, type) => {
    let db = collectionDB()
    let sqlAttach = `ATTACH DATABASE '${path.join(pwd(), CARD_DB_FILE)}' AS cardDB;`
    let sql = `SELECT * FROM collectionCards colCards INNER JOIN cardDB.cards cards ON cards.cardId = colCards.cardId ` +
        `WHERE colCards.collection = '${collection}'`
    try {
        db.prepare(sqlAttach).run()
        let cards = db.prepare(sql).all()
        switch (type) {
            case "JSON":
                return JSON.stringify(cards, null, 1)
            case "CSV":
                const fields = ['name', 'expName', 'expCardNumber', 'rarity', 'energyType', 'cardType', 'pokedex', 'variant', 'grade', 'paid', 'count'];
                const opts = { fields };
                return parse(cards, opts)
            case "txt-TCGP":
                let list = ""
                for (let card of cards) {
                    list += `${card.count} ${card.name} [${card.expCodeTCGP}]\n`
                }
                return list
        }

    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    } finally {
        db.close()
    }
}

const init = async () => {
    try {
        let prices = pricesDB()
        prices.prepare(`CREATE TABLE IF NOT EXISTS prices (id TEXT UNIQUE, date INTEGER, cardId TEXT, variant TEXT, vendor TEXT, price REAL)`).run()
        prices.close()
        let collections = collectionDB()
        collections.prepare(`CREATE TABLE IF NOT EXISTS collections (name TEXT UNIQUE, img TEXT)`).run()
        collections.prepare(`CREATE TABLE IF NOT EXISTS collectionCards (cardId TEXT, collection TEXT, variant TEXT, paid REAL, count INTEGER, grade TEXT)`).run()
        collections.close()
    } catch (err) {
        console.error(err)
    }
}

module.exports.appPath = appPath
module.exports.getCollectionDownload = getCollectionDownload
module.exports.dbStatus = dbStatus
module.exports.init = init
module.exports.pwd = pwd
module.exports.pricesDB = pricesDB
module.exports.collectionDB = collectionDB
module.exports.cardDB = cardDB
module.exports.CARD_DB_FILE = CARD_DB_FILE
module.exports.COLLECTION_DB_FILE = COLLECTION_DB_FILE
module.exports.PRICE_DB_FILE = PRICE_DB_FILE
module.exports.checkForDbUpdate = checkForDbUpdate
module.exports.getPrices = getPrices