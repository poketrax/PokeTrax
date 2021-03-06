const express = require("express");
const shell = require('electron').shell;
const { parse } = require('json2csv');
const cors = require('cors')
const path = require('path')
const app = express();
const fileCacheMiddleware = require("express-asset-file-cache-middleware");
const bodyParser = require('body-parser');
const DB = require('./database');
const os = require('os');

let server

//Start web server
const start = async () => {
    await DB.checkForDbUpdate().catch((err) => console.log(err))
    DB.init()
    server = app.listen(3030)
}

const stop = () => {
    server.close()
}
//exports for main
module.exports.start = start
module.exports.stop = stop

app.use(cors())

app.get("/dbstatus",
    (_, res) => {
        res.send(DB.dbStatus())
    }
)

/**
 * Get Card Img assest.  Will pull from local cache or the interwebz
 */
app.get("/cardImg/:asset_id",
    (req, res, next) => {
        let db = DB.cardDB()
        try {
            let card = db.prepare('SELECT img FROM cards WHERE cardId = $id').get({ "id": decodeURIComponent(req.params.asset_id) })
            if (card != null) {
                res.locals.fetchUrl = card.img;
                next();
            } else {
                res.status(403).send(`No card with id: ${req.params.asset_id}`)
            }
        } catch (err) {
            console.error(err)
            res.status(500).send('sqlerr: ' + err)
        } finally {
            db.close()
        }
    },
    fileCacheMiddleware({ cacheDir: path.join(DB.pwd(), "./cardImg"), maxSize: 1024 * 1024 * 1024 }),
    (_, res) => {
        res.set({
            "Content-Type": res.locals.contentType,
            "Content-Length": res.locals.contentLength,
        });
        res.end(res.locals.buffer, "binary");
    }
);

/**
 * Get Product Img assest.  Will pull from local cache or the interwebz
 */
app.get("/sealedImg/:asset_name",
    (req, res, next) => {
        let db = DB.cardDB()
        try {
            let card = db.prepare('SELECT img FROM sealed WHERE name = $name').get({ "name": decodeURIComponent(req.params.asset_name) })
            if (card != null) {
                res.locals.fetchUrl = card.img;
                res.locals.cacheKey = req.params.asset_name;
                next();
            } else {
                res.status(403).send(`No product with id: ${req.params.asset_name}`)
            }
        } catch (err) {
            console.error(err)
            res.status(500).send('sqlerr: ' + err)
        } finally {
            db.close()
        }
    },
    fileCacheMiddleware({ cacheDir: path.join(DB.pwd(), "./productImg"), maxSize: 1024 * 1024 * 1024 }),
    (_, res) => {
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
        let db = DB.cardDB()
        try {
            let series = db.prepare('SELECT icon FROM series WHERE name = $name').get({ "name": decodeURIComponent(req.params.asset_id) })
            if (series != null) {
                res.locals.fetchUrl = series.icon;
                res.locals.cacheKey = req.params.asset_id;
                next();
            } else {
                res.status(403).send(`No series with id: ${req.params.asset_id}`)
            }
        } catch (err) {
            res.status(500).send('sqlerr: ' + err)
        } finally {
            db.close()
        }
    },
    fileCacheMiddleware({ cacheDir: path.join(DB.pwd(), "./seriesImg"), maxSize: 1024 * 1024 * 1024 }),
    (_, res) => {
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
        let db = DB.cardDB()
        try {
            let exp = db.prepare('SELECT logoURL FROM expansions WHERE name = $name').get({ "name": decodeURIComponent(req.params.asset_id) })
            if (exp != null) {
                res.locals.fetchUrl = exp.logoURL;
                res.locals.cacheKey = req.params.asset_id;
                next();
            } else {
                res.status(403).send(`No expantion with id: ${req.params.asset_id}`)
            }
        } catch (err) {
            res.status(500).send('sqlerr: ' + err)
        } finally {
            db.close()
        }
    },
    fileCacheMiddleware({ cacheDir: path.join(DB.pwd(), "./expLogo"), maxSize: 1024 * 1024 * 1024 }),
    (_, res) => {
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
        let db = DB.cardDB()
        try {
            let exp = db.prepare('SELECT symbolURL FROM expansions WHERE name = $name').get({ "name": decodeURIComponent(req.params.asset_id) })
            if (exp != null) {
                res.locals.fetchUrl = exp.symbolURL;
                res.locals.cacheKey = req.params.asset_id;
                next();
            } else {
                res.status(403).send(`No expantion with id: ${req.params.asset_id}`)
            }
        } catch (err) {
            res.status(500).send('sqlerr: ' + err)
        } finally {
            db.close()
        }
    },
    fileCacheMiddleware({ cacheDir: path.join(DB.pwd(), "./expSymbol"), maxSize: 1024 * 1024 * 1024 }),
    (_, res) => {
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
app.get("/expansions", async (_, res) => {
    let db = DB.cardDB()
    try {
        let exps = db.prepare(`SELECT name, series, tcgName, numberOfCards, releaseDate FROM expansions`).all()
        res.send(exps)
    } catch (err) {
        res.status(500).send('sqlerr: ' + err)
    } finally {
        db.close()
    }
})

/** 
* Get Series
*/
app.get("/series", async (_, res) => {
    let db = DB.cardDB()
    try {
        let series = db.prepare(`SELECT name, releaseDate FROM series`).all()
        res.send(series)
    } catch (err) {
        res.status(500).send('sqlerr: ' + err)
    } finally {
        db.close()
    }
})

app.get("/card/rarities", (_, res) => {
    let db = DB.cardDB()
    try {
        let rarities = db.prepare(`SELECT DISTINCT rarity FROM cards`).all()
        let payload = []
        rarities.forEach(element => {
            payload.push(element.rarity)
        });
        res.send(payload)
    } catch (err) {
        res.status(500).send(`sqlErr: ${err}`)
    } finally {
        db.close()
    }
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
    let exps = req.query.expansions != null && req.query.expansions !== "%5B%22%22%5D" ? JSON.parse(decodeURIComponent(req.query.expansions)) : []
    let FILTER_EXP = ""
    if (exps != null && exps.length) {
        let expFilter = JSON.stringify(exps).replaceAll("[", "(").replaceAll("]", ")").replaceAll("'", "''").replaceAll("\"", "\'")
        FILTER_EXP = `AND expName in ${expFilter}`
    }
    // Rarities
    let rarities = req.query.rarities != null ? JSON.parse(decodeURIComponent(req.query.rarities)) : []
    let FILTER_RARE = ""
    if (rarities != null && rarities.length != 0) {
        let rareFilter = JSON.stringify(rarities).replaceAll("[", "(").replaceAll("]", ")").replaceAll("\"", "\'")
        FILTER_RARE = `AND rarity in ${rareFilter}`
    }

    let order
    switch (req.query.sort) {
        case "name":
            order = `ORDER BY name ASC`
            break
        case "setNumber":
            order = `ORDER BY expCardNumber ASC`
            break
        case "pokedex":
            order = `ORDER BY pokedex ASC`
            break
        case "priceASC":
            order = `ORDER BY price ASC`
            break
        case "priceDSC":
            order = `ORDER BY price DESC`
            break
        case "dateASC":
            order = `ORDER BY datetime(releaseDate) ASC`
            break
        case "dateDSC":
            order = `ORDER BY datetime(releaseDate) DESC`
            break
        default:
            order = ``
    }
    let db = DB.cardDB()
    try {
        let countSQL = `SELECT count(cardId) as cardCount FROM cards WHERE cardId like '%${nameFilter}%' ${FILTER_EXP} ${FILTER_RARE}`
        let sql = `SELECT name, cardId, idTCGP, expName, expCardNumber, expCodeTCGP, rarity, cardType, energyType, variants, pokedex, price FROM cards WHERE cardId like '%${nameFilter}%' ${FILTER_EXP} ${FILTER_RARE} ${order} LIMIT ${limit} OFFSET ${(req.params.page) * limit}`
        // console.log(countSQL)
        /// console.log(sql)
        let countRes = db.prepare(countSQL).get()
        let results = db.prepare(sql).all()
        res.send({ "total": countRes.cardCount, "cards": results })
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    } finally {
        db.close()
    }
})

app.get("/sealed/:page", (req, res) => {
    let limit = 25
    let order
    switch (req.query.sort) {
        case "name":
            order = `ORDER BY name ASC`
            break
        case "priceASC":
            order = `ORDER BY price ASC`
            break
        case "priceDSC":
            order = `ORDER BY price DESC`
            break
        default:
            order = ``
    }
    let NAME_FILTER = `'%%'`
    if (req.query.name != null && req.query.name !== '') {
        let name = decodeURIComponent(req.query.name)
        NAME_FILTER = `'%${name}%'`
    }

    let count = `SELECT count(name) as total FROM sealed WHERE name like ${NAME_FILTER} LIMIT 1`
    let sql = `SELECT * FROM sealed WHERE name like ${NAME_FILTER} ${order} LIMIT ${limit} OFFSET ${(req.params.page) * limit}`
    let db = DB.cardDB()
    try {
        let total = db.prepare(count).get()
        let products = db.prepare(sql).all()
        res.send({ total: total.total, products: products })
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    } finally {
        db.close()
    }
})

/**
 * Get prices of a posted card
 * body card object see Card.tsx
 * query:
 * start?: start time ISO string
 * end?: end time ISO string 
 */
app.post("/cards/price", bodyParser.json(), async (req, res) => {
    DB.getPrices(req.body, req.query.start, req.query.end).then(
        (value) => {
            switch(req.query.type){
                case "json":
                    res.send(value)
                    break
                case "csv":
                    res.send(parse(value))
                    break
                default:
                    res.send(value)
            }
        }
    ).catch(
        (err) => {
            res.status(500).send('sqlerr: ' + err)
            console.log(err)
        }
    )
})

/**
 * Get prices of a posted SealedProduct
 * body card object see SealedProduct.tsx
 * query:
 * start?: start time ISO string
 * end?: end time ISO string 
 * type?: {json, csv}
 */
 app.post("/sealed/price", bodyParser.json(), async (req, res) => {
    DB.getProductPrice(req.body, req.query.start, req.query.end).then(
        (value) => {
            switch(req.query.type){
                case "json":
                    res.send(value)
                case "csv":
                    res.send(parse(value))
                default:
                    res.send(value)
            }
        }
    ).catch(
        (err) => {
            res.status(500).send('sqlerr: ' + err)
            console.log(err)
        }
    )
})

/**
 * Get Collections
 */
app.get("/collections", (_, res) => {
    let db = DB.collectionDB()
    try {
        let collections = db.prepare(`SELECT * FROM collections`).all()
        res.send(collections)
    } catch {
        console.log(err)
        res.status(500).send(err)
    } finally {
        db.close()
    }
})

/**
 * PUT Collections
 * body: see model/Collection.ts
 */
app.put("/collections", bodyParser.json(),
    async (req, res) => {
        let db = DB.collectionDB()
        try {
            db.prepare('INSERT INTO collections (name, img) values ($name, $img)').run({ 'name': req.body.name, 'img': req.body.name })
            res.status(201).send()
        } catch (err) {
            res.status(400).send(err)
            console.log(err)
        }
    })

app.delete("/collections", bodyParser.json(),
    (req, res) => {
        let db = DB.collectionDB()
        let collection = req.body
        try {
            db.prepare('DELETE FROM collections WHERE name = $name').run(collection)
            db.prepare("DELETE FROM collectionCards WHERE collection = $name").run(collection)
            res.send()
        } catch (err) {
            res.status(500).send()
        }
    }
)

/**
 * Update Collection card
 */
app.put("/collections/card", bodyParser.json(),
    async (req, res) => {
        let db = DB.collectionDB()
        let card = req.body
        try {
            let findSql = "SELECT * from collectionCards WHERE cardId = $cardId AND variant = $variant AND collection = $collection AND grade = $grade"
            let found = db.prepare(findSql).get(card)
            await DB.getPrices(card)
            if (found != null) {
                await db.prepare("UPDATE collectionCards SET count = $count, grade = $grade, paid = $paid WHERE cardId = $cardId AND variant = $variant AND grade = $grade")
                    .run({ 'count': card.count, 'grade': card.grade, 'paid': card.paid, 'cardId': card.cardId, 'variant': card.variant })
                res.status(201).send()
            } else {
                await db.prepare("INSERT INTO collectionCards (cardId, collection, variant, paid, count, grade) VALUES ($cardId, $collection, $variant, $paid, $count, $grade)")
                    .run({ 'cardId': card.cardId, 'collection': card.collection, 'variant': card.variant, 'paid': card.paid, 'count': card.count, 'grade': card.grade })
                res.status(201).send()
            }
        } catch (err) {
            console.log(err)
            res.status(500).send(JSON.stringify(err))
        } finally {
            db.close()
        }
    }
)

/**
 * Delete Collection Card
 */
app.delete("/collections/card", bodyParser.json(),
    (req, res) => {
        let card = req.body
        let db = DB.collectionDB()
        try {
            let del = "DELETE FROM collectionCards WHERE cardId = $cardId AND variant = $variant AND collection = $collection AND grade = $grade"
            db.prepare(del).run(card)
            res.send()
        } catch (err) {
            console.log(err)
            res.status(500).send()
        }
    }
)

/**
 * Get Collection cards
 */
app.get("/collections/:collection/cards/:page", (req, res) => {
    let NAME_FILTER = ``
    let order
    switch (req.query.sort) {
        case "name":
            order = `ORDER BY name ASC`
            break
        case "setNumber":
            order = `ORDER BY expCardNumber ASC`
            break
        case "pokedex":
            order = `ORDER BY pokedex ASC`
            break
        case "priceASC":
            order = `ORDER BY price ASC`
            break
        case "priceDSC":
            order = `ORDER BY price DESC`
            break
        case "wish":
            order = `ORDER BY count ASC`
            break
        case "dateASC":
            order = `ORDER BY datetime(releaseDate) ASC`
            break
        case "dateDSC":
            order = `ORDER BY datetime(releaseDate) DESC`
            break
        default:
            order = ``
    }
    if (req.query.name != null && req.query.name != '') {
        NAME_FILTER = `AND _collections.cardId like '%${decodeURI(req.query.name)}%'`
    }
    let rarities = req.query.rarities != null ? JSON.parse(decodeURIComponent(req.query.rarities)) : []
    let FILTER_RARE = ""
    if (rarities != null && rarities.length != 0) {
        let rareFilter = JSON.stringify(rarities).replaceAll("[", "(").replaceAll("]", ")").replaceAll("\"", "\'")
        FILTER_RARE = `AND rarity in ${rareFilter}`
    }

    let db = DB.pricesDB()
    let sqlSelect =
        `SELECT max(date) as date, _price.variant, _collections.*, _cards.*, _price.price
        FROM prices _price
        INNER JOIN collectionDB.collectionCards _collections 
            ON _price.cardId = _collections.cardId 
            AND _price.variant = _collections.variant
        INNER JOIN cardDB.cards _cards
            ON _price.cardId = _cards.cardId
        WHERE _collections.collection = $collection ${NAME_FILTER} ${FILTER_RARE}
        GROUP BY _price.cardId, _price.variant, _collections.grade
    ${order}`
    let limit = `LIMIT 25 OFFSET ${(req.params.page) * 25}`

    let sqlAttachCard = `ATTACH DATABASE '${path.join(DB.pwd(), DB.CARD_DB_FILE)}' AS cardDB;`
    let sqlAttachColl = `ATTACH DATABASE '${path.join(DB.pwd(), DB.COLLECTION_DB_FILE)}' AS collectionDB;`

    try {
        db.prepare(sqlAttachCard).run()
        db.prepare(sqlAttachColl).run()
        let count = db.prepare(`SELECT count(cardID) as count FROM (${sqlSelect})`).get({ collection: req.params.collection })
        let cards = db.prepare(`${sqlSelect} ${limit}`).all({ collection: req.params.collection })
        res.send({ "total": count.count, "cards": cards })
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    } finally {
        db.close()
    }
})

/**
 * Update Collection product
 */
app.put("/collections/sealed", bodyParser.json(),
    async (req, res) => {
        let db = DB.collectionDB()
        let sealed = req.body
        try {
            let findSql = "SELECT * from collectionProducts WHERE name = $name AND collection = $collection"
            let found = db.prepare(findSql).get(sealed)
            if (found != null) {
                db.prepare("UPDATE collectionProducts SET count = $count, grade = $grade, paid = $paid WHERE name = $name")
                    .run(sealed)
                res.status(201).send()
            } else {
                db.prepare("INSERT INTO collectionProducts (name, collection, paid, count) VALUES ($name, $collection, $paid, $count)")
                    .run(sealed)
                res.status(201).send()
            }
        } catch (err) {
            console.log(err)
            res.status(500).send(JSON.stringify(err))
        } finally {
            db.close()
        }
    }
)

/**
* Delete Collection product
*/
app.delete("/collections/sealed", bodyParser.json(),
    (req, res) => {
        let sealed = req.body
        let db = DB.collectionDB()
        try {
            let del = "DELETE FROM collectionProducts WHERE name = $name AND collection = $collection"
            db.prepare(del).run(sealed)
            res.send()
        } catch (err) {
            console.log(err)
            res.status(500).send()
        }
    }
)

/**
 * Get Collection prodcuts
 */
app.get("/collections/:collection/sealed/:page", (req, res) => {
    let NAME_FILTER = ``
    let order
    switch (req.query.sort) {
        case "name":
            order = `ORDER BY name ASC`
            break
        case "priceASC":
            order = `ORDER BY price ASC`
            break
        case "priceDSC":
            order = `ORDER BY price DESC`
            break
        case "wish":
            order = `ORDER BY count ASC`
            break
        default:
            order = ``
    }
    if (req.query.name != null && req.query.name != '') {
        NAME_FILTER = `AND _collections.cardId like '%${decodeURI(req.query.name)}%'`
    }

    let db = DB.collectionDB()
    let sqlSelect =
        `SELECT _sealed.*, _collection.collection, _collection.paid, _collection.count
        FROM collectionProducts _collection
        INNER JOIN cardDB.sealed _sealed
        WHERE _collection.collection = $collection AND _collection.name == _sealed.name
        ${NAME_FILTER}
        ${order}`
    let limit = `LIMIT 25 OFFSET ${(req.params.page) * 25}`
    let sqlAttachCard = `ATTACH DATABASE '${path.join(DB.pwd(), DB.CARD_DB_FILE)}' AS cardDB;`

    try {
        db.prepare(sqlAttachCard).run()
        let count = db.prepare(`SELECT count(name) as count FROM (${sqlSelect})`).get({ collection: req.params.collection })
        let cards = db.prepare(`${sqlSelect} ${limit}`).all({ collection: req.params.collection })
        res.send({ "total": count.count, "products": cards })
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    } finally {
        db.close()
    }
})


app.get("/collections/download/:collection/:type", (req, res) => {
    res.send(DB.getCollectionDownload(req.params.collection, req.params.type))
})

app.get("/collections/:collection/value", (req, res) => {
    let sqlSelect = `
    SELECT max(date) as date, _price.price, _collections.paid, _collections.count
    FROM prices _price
    INNER JOIN collectionDB.collectionCards _collections 
        ON _price.cardId = _collections.cardId 
        AND _price.variant = _collections.variant
    INNER JOIN cardDB.cards _cards
        ON _price.cardId = _cards.cardId
    WHERE _collections.collection = $collection
    GROUP BY _price.cardId, _price.variant`

    let sqlAttachCard = `ATTACH DATABASE '${path.join(DB.pwd(), DB.CARD_DB_FILE)}' AS cardDB;`
    let sqlAttachColl = `ATTACH DATABASE '${path.join(DB.pwd(), DB.COLLECTION_DB_FILE)}' AS collectionDB;`
    let db = DB.pricesDB()
    try {
        db.prepare(sqlAttachCard).run()
        db.prepare(sqlAttachColl).run()
        let totalValue = db.prepare(`SELECT sum(price * count) as totalValue, sum(paid) as totalPaid from(${sqlSelect})`).get({ collection: req.params.collection })
        res.send(totalValue)
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    } finally {
        db.close()
    }
})

app.post("/openlink", bodyParser.json(), (req, res) => {
    let linkReq = req.body
    let card = linkReq.card
    let product = linkReq.product
    switch (linkReq.type) {
        case 'tcgp':
            let code = 0
            if (card) {
                code = typeof (card?.idTCGP) === 'string' ? parseInt(card?.idTCGP).toFixed(0) : card?.idTCGP
            } else {
                code = typeof (product?.idTCGP) === 'string' ? parseInt(product?.idTCGP).toFixed(0) : product?.idTCGP
            }
            console.log('https://tcgplayer.com/product/' + code)
            shell.openExternal('https://tcgplayer.com/product/' + code)
            res.send()
            break;
        case 'ebay':
            let name = ""
            if (card) {
                name = linkReq.card?.cardId.replaceAll("-", " ") ?? linkReq.card?.name
            } else {
                name = linkReq.product?.name
            }
            let ebayUrl = new URL('https://www.ebay.com/sch')
            ebayUrl.searchParams.set('kw', name)
            ebayUrl.searchParams.set('mkevt', '1')
            ebayUrl.searchParams.set('mkcid', '1')
            ebayUrl.searchParams.set('mkrid', '711-53200-19255-0')
            ebayUrl.searchParams.set('campid', '5338928550')
            ebayUrl.searchParams.set('toolid', '10001')
            ebayUrl.searchParams.set('customid', `pt-${os.platform()}`)
            shell.openExternal(ebayUrl.toString())
            res.send()
            break;
        case 'amazon':
            let aname = ""
            if (card) {
                aname = linkReq.card?.cardId.replaceAll("-", " ") ?? linkReq.card?.name
            } else {
                aname = linkReq.product?.name
            }
            let amazonUrl = new URL('https://www.amazon.com/s')
            amazonUrl.searchParams.set('k', aname)
            amazonUrl.searchParams.set('linkCode', 'll2')
            amazonUrl.searchParams.set('tag', 'poketrax-20')
            amazonUrl.searchParams.set('language', 'en_US')
            shell.openExternal(amazonUrl.toString())
            break;
        case 'newSoftware':
            switch (os.platform()) {
                case 'win32':
                    shell.openExternal(`https://github.com/poketrax/PokeTrax/releases/latest/download/poketrax.exe`)
                    break;
                case 'darwin':
                    shell.openExternal(`https://github.com/poketrax/PokeTrax/releases/latest/download/poketrax.dmg`)
                    break;
                case 'linux':
                    shell.openExternal(`https://github.com/poketrax/PokeTrax/releases/latest/download/poketrax.snap`)
                    break;
                default:
                    shell.openExternal(`https://poketrax.github.io/PokeTrax/`)
            }
            break;
        default:
            console.log(`Body empty ${JSON.stringify(req.body)}`)
            res.status(400).send(`Body empty ${JSON.stringify(req.body)}`)
    }
})