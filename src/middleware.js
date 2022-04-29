const express = require("express");
const cors = require('cors')
const path = require('path')
const sqlite3 = require("sqlite3")
const https = require("follow-redirects").https
const fs = require('fs')
const axios = require('axios')
const fileCacheMiddleware = require("express-asset-file-cache-middleware");
const app = express();
const os = require("os");
const lodash = require("lodash");
const hash = require('object-hash');
const bodyParser = require('body-parser');
const compver = require('compare-version')

const DB_META = "./sql/meta.json"
const CARD_DB_FILE = "./sql/data.sqlite3"
const PRICE_DB_FILE = "./sql/prices.sqlite3"

//Start web server
const start = () => {
    app.listen(3030)
}

/* Print the working directory for the application to get date files */
const pwd = () => {
    if (process.env.NODE_ENV === 'development') {
        return "./"
    }
    switch (os.platform()) {
        case 'darwin': return '/Applications/PokeTrax.app/Contents/'
        case 'win32': return ''
        default: return "./"
    }
}

//Init card Database
let carddb = new sqlite3.Database(
    path.join(pwd(), CARD_DB_FILE),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) console.error('Database opening error: ', err);
    }
);

//Init prices database
let pricesdb = new sqlite3.Database(
    path.join(pwd(), PRICE_DB_FILE),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) console.error('Database opening error: ', err);
    }
)
pricesdb.run(`CREATE TABLE IF NOT EXISTS prices (id TEXT UNIQUE, date INTEGER, cardId TEXT, variant TEXT, vendor TEXT, price REAL)`)

//Check for card Updates
let dbUpdate = { ready: false, updated: false }
const checkForDbUpdate = () => {
    return new Promise(
        async (resolve, reject) => {
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
                let current = fs.readFileSync(path.join(pwd(), DB_META), { encoding: 'utf8', flag: 'r' })
                if (compver(current.version, meta.version) > 0) {
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

//pull release info from database repo
async function pullDbMeta() {
    return new Promise(
        async (resolve, reject) => {
            try {
                let release = await axios.get('https://api.github.com/repos/jgunzelman88/pokepull/releases/latest')
                let asset = release.data.assets.find((value) => value.name === "data.sqlite3")
                resolve({ version: release.data.name, asset: asset.browser_download_url })
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
                    carddb = new sqlite3.Database(
                        path.join(pwd(), CARD_DB_FILE),
                        sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
                        (err) => {
                            if (err) console.error('Database opening error: ', err);
                        }
                    );
                    resolve()
                })
                writer.on('error', () => { reject() })
            })
        }
    )
}

//exports for main
module.exports.pwd = pwd
module.exports.start = start
module.exports.checkForDbUpdate = checkForDbUpdate

app.use(cors())

app.get("/dbstatus",
    (_, res) => {
        res.send(dbUpdate)
    }
)

/**
 * Get Card Img assest.  Will pull from local cache or the interwebz
 */
app.get("/cardImg/:asset_id",
    async (req, res, next) => {
        carddb.get('SELECT img FROM cards WHERE cardId = $id', { "$id": req.params.asset_id }, (err, row) => {
            if (err) {
                res.status(500).send('sqlerr: ' + err)
            } else {
                res.locals.fetchUrl = row.img;
                res.locals.cacheKey = row.asset_id;
                next();
            }
        })
    },
    fileCacheMiddleware({ cacheDir: path.join(pwd(), "./cardImg"), maxSize: 1024 * 1024 * 1024 }),
    (req, res) => {
        res.set({
            "Content-Type": res.locals.contentType,
            "Content-Length": res.locals.contentLength,
        });
        res.end(res.locals.buffer, "binary");
    }
);

/**
 * Get Series Img assest.  Will pull from local cache or the interwebz
 */
app.get("/seriesImg/:asset_id",
    async (req, res, next) => {
        carddb.get('SELECT icon FROM series WHERE name = $name', { "$name": decodeURIComponent(req.params.asset_id) }, (err, row) => {
            if (err) {
                res.status(500).send('sqlerr: ' + err)
            } else {
                res.locals.fetchUrl = row.icon;
                res.locals.cacheKey = row.asset_id;
                next();
            }
        })
    },
    fileCacheMiddleware({ cacheDir: path.join(pwd(), "./seriesImg"), maxSize: 1024 * 1024 * 1024 }),
    (req, res) => {
        res.set({
            "Content-Type": res.locals.contentType,
            "Content-Length": res.locals.contentLength
        });
        res.end(res.locals.buffer, "binary");
    }
);

/**
 * Get Exp Img assest.  Will pull from local cache or the interwebz
 */
app.get("/expLogo/:asset_id",
    async (req, res, next) => {
        carddb.get('SELECT logoURL FROM expansions WHERE name = $name', { "$name": decodeURIComponent(req.params.asset_id) }, (err, row) => {
            if (err) {
                res.status(500).send('sqlerr: ' + err)
            } else {
                res.locals.fetchUrl = row.logoURL;
                res.locals.cacheKey = row.asset_id;
                next();
            }
        })
    },
    fileCacheMiddleware({ cacheDir: path.join(pwd(), "./expLogo"), maxSize: 1024 * 1024 * 1024 }),
    (req, res) => {
        res.set({
            "Content-Type": res.locals.contentType,
            "Content-Length": res.locals.contentLength
        });
        res.end(res.locals.buffer, "binary");
    }
);

/**
 * Get Symbol Img assest.  Will pull from local cache or the interwebz
 */
app.get("/expSymbol/:asset_id",
    async (req, res, next) => {
        carddb.get('SELECT symbolURL FROM expansions WHERE name = $name', { "$name": decodeURIComponent(req.params.asset_id) }, (err, row) => {
            if (err) {
                res.status(500).send('sqlerr: ' + err)
                console.log('sqlerr: ' + err)
            } else {
                res.locals.fetchUrl = row.symbolURL;
                res.locals.cacheKey = row.asset_id;
                next();
            }
        })
    },
    fileCacheMiddleware({ cacheDir: path.join(pwd(), "./expSymbol"), maxSize: 1024 * 1024 * 1024 }),
    (req, res) => {
        res.set({
            "Content-Type": res.locals.contentType,
            "Content-Length": res.locals.contentLength
        });
        res.end(res.locals.buffer, "binary");
    }
);

/**
 *  Get Expansions 
 */
app.get("/expansions", async (req, res) => {
    carddb.all(`SELECT name, series, tcgName, numberOfCards, releaseDate FROM expansions`, (err, rows) => {
        if (err) {
            res.status(500).send('sqlerr: ' + err)
        } else {
            res.send(rows)
        }
    })
})

/** 
* Get Series
*/
app.get("/series", async (req, res) => {
    carddb.all(`SELECT name, releaseDate FROM series`, (err, rows) => {
        if (err) {
            res.status(500).send('sqlerr: ' + err)
        } else {
            res.send(rows)
        }
    })
})

/**
 * Search for card
 * /cards/{page number}
 * query vars:
 * name: searcn value
 * rarities: rarity filter
 * expansions: expantions filter
 * sort: [name, setNumber]
 */
app.get("/cards/:page", async (req, res) => {
    let limit = 25
    let nameFilter = req.query.name != null ? decodeURIComponent(req.query.name).replaceAll(" ", "-") : ""
    // Expansions 
    let exps = JSON.parse(decodeURIComponent(req.query.expansions))
    let FILTER_EXP = ""
    if (exps != null && exps.length) {
        let expFilter = JSON.stringify(exps).replaceAll("[", "(").replaceAll("]", ")")
        FILTER_EXP = `AND expName in ${expFilter}`
    }
    // Rarities
    let rarities = req.query.rarities != null ? JSON.parse(decodeURIComponent(req.query.rarities)) : []
    let FILTER_RARE = ""
    if (rarities != null && rarities.length != 0) {
        let rareFilter = JSON.stringify(rarities).replaceAll("[", "(").replaceAll("]", ")")
        FILTER_RARE = `AND rarity in ${rareFilter}`
    }

    let order
    switch (req.query.sort) {
        case "name":
            order = `ORDER BY cardId ASC`
            break
        case "setNumber":
            order = `ORDER BY expCardNumber ASC`
            break
        default:
            order = ``
    }

    let count = `SELECT count(cardId) FROM cards WHERE cardId like '%${nameFilter}%' ${FILTER_EXP} ${FILTER_RARE}`
    let sql = `SELECT name, cardId, idTCGP, expName, expCardNumber, rarity, cardType, energyType FROM cards WHERE cardId like '%${nameFilter}%' ${FILTER_EXP} ${FILTER_RARE} ${order} LIMIT ${limit} OFFSET ${(req.params.page) * 25}`
    carddb.get(count, (err1, row) => {
        carddb.all(sql, (err2, rows) => {
            if (err1) {
                res.status(500).send('sqlerr: ' + err2)
                console.log(err2)
            } else {
                if (err2) {
                    res.status(500).send('sqlerr: ' + err2)
                    console.log(err2)
                } else {
                    res.send({ total: row['count(cardId)'], cards: rows })
                }
            }
        })
    })

})

/**
 * Debounced function for retrieving TCP Player price data.
 * Prevents being locked out for too many requests.  
 * Also caches price data in price database
 * @param {*} card 
 * @param {*} callback 
 */
function getTcgpPrice(card, callback) {
    let bounce = lodash.debounce(
        () => {
            let prices = []
            axios.get(`https://infinite-api.tcgplayer.com/price/history/${card.idTCGP}?range=month`).then((api) => {
                for (let result of api.data.result) {
                    let date = Date.parse(result.date)
                    result.variants.forEach(
                        (variant) => {
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
                                        VALUES ($id, $date, $cardId, $variant, $vendor, $price)
                                        `
                            pricesdb.run(sql,
                                {
                                    "$id": hash(price),
                                    "$date": price.date,
                                    "$cardId": price.cardId,
                                    "$variant": price.variant,
                                    "$vendor": price.vendor,
                                    "$price": price.price
                                }, (err) => {
                                    if (err) {
                                        console.log("err: " + err)
                                    }
                                })
                        }
                    )
                }
                callback(prices)
            }).catch((err) => {
                callback(err)
            })
        }, 300)
    bounce()
}

/**
 * Get prices from database
 * @param {*} cardId 
 * @param {*} _start 
 * @param {*} _end 
 * @param {*} variant 
 * @returns 
 */
async function getPrices(cardId, _start, _end, variant) {
    return new Promise(
        (resolve, reject) => {
            let now = new Date();
            now.setTime(Date.now())

            let then = new Date()
            then.setTime(Date.now())
            then.setDate(now.getDate() - 1)

            let endDate = _end != null ? new Date(_end) : now
            let startDate = _start != null ? new Date(_start) : then
            let sql = `SELECT * FROM prices WHERE cardId = $cardId AND date > $start AND date < $end ORDER BY date DESC`

            pricesdb.all(sql, { "$cardId": cardId, "$start": startDate.getTime(), "$end": endDate.getTime() }, (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        }
    )
}

/**
 * Get prices of a posted card
 * body card object see Card.tsx
 * query:
 * start?: start time ISO string
 * end?: end time ISO string 
 */
app.post("/price", bodyParser.json(), async (req, res) => {
    getPrices(req.body.cardId, req.query.start, req.query.end, req.query.variant).then(
        (value) => {
            if (value.length) {
                res.send(value)
            } else {
                getTcgpPrice(req.body, (prices) => {
                    if (prices.length) {
                        res.send(prices)
                    } else {
                        res.status(500).send(prices)
                    }
                })
            }
        }
    ).catch(
        (err) => {
            res.status(500).send('sqlerr: ' + err)
            console.log(err)
        }
    )
})