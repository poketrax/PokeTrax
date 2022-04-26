const express = require("express");
const cors = require('cors')
const path = require('path')
const sqlite3 = require("sqlite3")
const axios = require('axios')
const fileCacheMiddleware = require("express-asset-file-cache-middleware");
const app = express();
const os = require("os");
const lodash = require("lodash");
const hash = require('object-hash');
const bodyParser = require('body-parser');

var start = function start() {
    app.listen(3030)
}

var pwd = function pwd() {
    if (process.env.NODE_ENV === 'development') {
        return "./"
    }
    switch (os.platform()) {
        case 'darwin': return '/Applications/PokeTrax.app/Contents/'
        case 'win32': return ''
        default: return "./"
    }
}

module.exports.pwd = pwd
module.exports.start = start

const db = new sqlite3.Database(
    path.join(pwd(), './sql/data.sqlite3'),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) console.error('Database opening error: ', err);
    }
);

const pricesdb = new sqlite3.Database(
    path.join(pwd(), './sql/prices.sqlite3'),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) console.error('Database opening error: ', err);
    }
)

pricesdb.run(`CREATE TABLE IF NOT EXISTS prices (id TEXT UNIQUE, date INTEGER, cardId TEXT, variant TEXT, vendor TEXT, price REAL)`)

app.use(cors())

/*Card Img*/
app.get("/cardImg/:asset_id",
    async (req, res, next) => {
        db.get('SELECT img FROM cards WHERE cardId = $id', { "$id": req.params.asset_id }, (err, row) => {
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
/* Series Image */
app.get("/seriesImg/:asset_id",
    async (req, res, next) => {
        db.get('SELECT icon FROM series WHERE name = $name', { "$name": decodeURIComponent(req.params.asset_id) }, (err, row) => {
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

/* Expansion Image */
app.get("/expLogo/:asset_id",
    async (req, res, next) => {
        db.get('SELECT logoURL FROM expansions WHERE name = $name', { "$name": decodeURIComponent(req.params.asset_id) }, (err, row) => {
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

/* Symbol Image */
app.get("/expSymbol/:asset_id",
    async (req, res, next) => {
        db.get('SELECT symbolURL FROM expansions WHERE name = $name', { "$name": decodeURIComponent(req.params.asset_id) }, (err, row) => {
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

/* Get Expansions */
app.get("/expansions", async (req, res) => {
    db.all(`SELECT name, series, tcgName, numberOfCards, releaseDate FROM expansions`, (err, rows) => {
        if (err) {
            res.status(500).send('sqlerr: ' + err)
        } else {
            res.send(rows)
        }
    })
})

/* Get Series */
app.get("/series", async (req, res) => {
    db.all(`SELECT name, releaseDate FROM series`, (err, rows) => {
        if (err) {
            res.status(500).send('sqlerr: ' + err)
        } else {
            res.send(rows)
        }
    })
})

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
    switch(req.query.sort){
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
    db.get(count, (err1, row) => {
        db.all(sql, (err2, rows) => {
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