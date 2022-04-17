const express = require("express");
const cors = require('cors')
const sqlite3 = require("sqlite3")
const axios = require('axios')
const fileCacheMiddleware = require("express-asset-file-cache-middleware");
const app = express();

const db = new sqlite3.Database('./public/sql/data.sqlite3', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) console.error('Database opening error: ', err);
});

var start = function start() {
    app.listen(3030)
}

app.use(cors())

module.exports.start = start
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
    fileCacheMiddleware({ cacheDir: "./cardImg", maxSize: 10 * 1024 * 1024 * 1024 }),
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
    fileCacheMiddleware({ cacheDir: "./seriesImg", maxSize: 10 * 1024 * 1024 * 1024 }),
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
    fileCacheMiddleware({ cacheDir: "./expLogo", maxSize: 10 * 1024 * 1024 * 1024 }),
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
    fileCacheMiddleware({ cacheDir: "./expLogo", maxSize: 10 * 1024 * 1024 * 1024 }),
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
    if (exps != null && exps.length ) {
        let expFilter = JSON.stringify(exps).replaceAll("[", "(").replaceAll("]", ")")
        FILTER_EXP = `AND expName in ${expFilter}`
    }
    // Rarities
    let rarities = req.query.rarities != null ? JSON.parse(decodeURIComponent(req.query.rarities)) : []
    let FILTER_RARE = ""
    if(rarities != null && rarities.length != 0){
        let rareFilter = JSON.stringify(rarities).replaceAll("[", "(").replaceAll("]", ")")
        FILTER_RARE = `AND rarity in ${rareFilter}`
    }
    let count = `SELECT count(cardId) FROM cards WHERE cardId like '%${nameFilter}%' ${FILTER_EXP} ${FILTER_RARE}`
    let sql = `SELECT name, cardId, idTCGP, expName, expCardNumber, rarity, cardType, energyType FROM cards WHERE cardId like '%${nameFilter}%' ${FILTER_EXP} ${FILTER_RARE} LIMIT ${limit} OFFSET ${(req.params.page) * 25}`
    console.log(sql)
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
                    res.send({total: row['count(cardId)'], cards: rows})
                }
            }
        })
    })

})

app.get("/price/:productId", async (req, res) => {
    axios.get(`https://mpapi.tcgplayer.com/v2/product/${req.params.productId}/pricepoints`).then(
        (api) => {
            res.send(api.data)
        },
        (err) => {
            res.send(err)
        }
    )
})