import * as jsdom from 'jsdom'
import axios from 'axios'
import sqlite3 from 'sqlite3'
import * as fs from 'fs'

export const cardCreateDb =
    `CREATE TABLE IF NOT EXISTS cards (
cardId TEXT UNIQUE,
idTCGP TEXT NULL,
name TEXT,
expIdTCGP TEXT NULL,
expName TEXT,
expCardNumber TEXT,
rarity TEXT,
img TEXT,
description TEXT NULL,   
releaseDate TEXT NULL,
energyType TEXT NULL,
cardType TEXT NULL
);`

export const expansionCreateDb =
    `CREATE TABLE IF NOT EXISTS expansions (
name TEXT UNIQUE,
series TEXT,
tcgName TEXT,
pokellectorSet TEXT,
numberOfCards INTEGER,
logoURL TEXT,
symbolURL TEXT,
releaseDate TEXT
);`

export const seriesCreateDb =
    `CREATE TABLE IF NOT EXISTS series (
name TEXT UNIQUE,
icon TEXT,
releaseDate TEXT
);`

export const addExpSql =
    "INSERT INTO expansions (name, series, tcgName, pokellectorSet, numberOfCards, logoURL, symbolURL) " +
    "VALUES ($name, $series, $tcgName, $pokellectorSet, $numberOfCards, $logoURL, $symbolURL)";

export const addCardSql =
    "INSERT INTO cards (cardId, idTCGP, name, expIdTCGP, expName, expCardNumber, rarity, img, description, releaseDate, energyType, cardType) " +
    "VALUES ($cardId, $idTCGP, $name, $expIdTCGP, $expName, $expCardNumber, $rarity, $img, $description, $releaseDate, $energyType, $cardType);"

export const addSeriesSql =
    "INSERT INTO series (name, icon, releaseDate) " +
    "VALUES ($name, $icon, $releaseDate);"

const tcgRequest = `{
    "algorithm": "",
    "from": 0,
    "size": 350,
    "filters": {
        "term": {
            "productLineName": [
                "pokemon"
            ],
            "setName": [
            ],
            "productTypeName": [
                "Cards"
            ]
        },
        "range": {},
        "match": {}
    },
    "listingSearch": {
        "filters": {
            "term": {},
            "range": {
                "quantity": {
                    "gte": 1
                }
            },
            "exclude": {
                "channelExclusion": 0
            }
        },
        "context": {
            "cart": {}
        }
    },
    "context": {
        "cart": {},
        "shippingCountry": "US"
    },
    "sort": {}
}`

let tcgPlayerSets = []
let missingData = JSON.parse(fs.readFileSync("./public/missingdata.json").toString())

const db = new sqlite3.Database('./public/sql/data.sqlite3', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) console.error('Database opening error: ', err);
});

async function dataInit() {
    console.log("tables")
    await createTables()
    console.log("meta")
    await getTCGPmetaData()
    console.log("sets")
    await getPokellectorSeries()
    console.log("close")
    db.close()
}

async function createTables() {
    await db.serialize(async () => {
        db.run(cardCreateDb, (err, _) => {
            if (err) console.log(err)
        })
        db.run(expansionCreateDb, (err, _) => {
            if (err) console.log(err)
        })
        db.run(seriesCreateDb, (err, _) => {
            if (err) console.log(err)
        })
    })
}

async function getTCGPmetaData() {
    let requestTcgSets = JSON.parse(tcgRequest)
    return axios.post(`https://mpapi.tcgplayer.com/v2/search/request?q=&isList=false`, requestTcgSets).then((res) => {
        console.log(res.data.results[0].aggregations.rarityName.map((rare) => rare.value))
        console.log(res.data.results[0].aggregations.cardType.map((type) => type.value))
        res.data.results[0].aggregations.setName.forEach(
            (element) => {
                tcgPlayerSets.push(element.urlValue)
            }
        )
    })
}

/**
 * Checks for new sets will not overwrite old ones will only add new sets
 */
async function getPokellectorSeries() {
    //scrap series from pokellector
    let res = await axios.get(`https://www.pokellector.com/sets`);
    const { window } = new jsdom.JSDOM(res.data)
    const left = window.document.getElementById("columnLeft")
    const seriesName = left?.getElementsByTagName("h1")
    const seriesExp = left?.getElementsByClassName("buttonlisting")
    //cycle though series
    if (seriesName != null) {
        for (let i = 0; i < seriesName.length; i++) {
            let series_name = seriesName[i].textContent?.replaceAll("Series", "").trim() || "n/a"
            let series_icon = seriesName[i].getElementsByTagName("img")[0].src
            //create new series not found
            let series = { $name: series_name, $icon: series_icon, $releaseDate: "" }
            let foundSeries = await dbSelect(`SELECT * FROM series WHERE name = $name`, { '$name': series_name })
            if (foundSeries.length == 0) {
                await dbRun(addSeriesSql, series)
            }
            //cycle though expansions looking for new ones
            if (seriesExp != null) {
                const expButtons = seriesExp[i].getElementsByClassName("button")
                if (expButtons != null) {
                    for (let button of expButtons) {
                        let span = button.getElementsByTagName("span")[0]
                        let expName = span?.textContent?.trim()
                        let imgs = button.getElementsByTagName("img")
                        let exp = {
                            $name: expName,
                            $series: series_name,
                            $tcgName: findTcgSetName(expName, series_name, tcgPlayerSets),
                            $pokellectorSet: null,
                            $numberOfCards: 0,
                            $logoURL: imgs[0].src,
                            $symbolURL: imgs[1].src
                        }
                        let found = await dbSelect('SELECT * FROM "expansions" WHERE name = $name', { "$name": expName })
                        if (found.length == 0) {
                            await dbRun(addExpSql, exp)
                            console.log(`Pulling ${exp.$name} `)
                            if (exp.$tcgName[0] === 'N/A') {
                                pullCardsPokellecotor(exp)
                            } else {
                              await pullCardsTCGP(exp)
                            }
                        }
                    }
                }
            }
        }
    }
}

//Pull cards from pokellector
function pullCardsPokellecotor(expantion) {
    console.log("Pokellector BLAM")
}

//Pull cards from tcg player
async function pullCardsTCGP(expantion) {
    let request = JSON.parse(tcgRequest)
    request.filters.term.setName = JSON.parse(expantion.$tcgName)
    let res = await axios.post(`https://mpapi.tcgplayer.com/v2/search/request?q=&isList=false`, request)
    let count = 0
    let releaseDate
    for (let card of res.data.results[0].results) {
        let name = card.productName;
        releaseDate = releaseDate == null ? card.customAttributes.releaseDate : releaseDate
        if (name.includes("Code Card") === false) {
            let cardNum = card.customAttributes.number.split("/")[0]
            let newCard = {
                "$cardId": `${expantion.$name.replaceAll(" ", "-")}-${name.replaceAll(" ", "-")}-${cardNum}`,
                "$idTCGP": card.productId,
                "$name": name,
                "$expIdTCGP": card.setUrlName,
                "$expName": expantion.$name,
                "$expCardNumber": cardNum,
                "$rarity": card.rarityName,
                "$img": `https://tcgplayer-cdn.tcgplayer.com/product/${card.productId.toFixed()}_200w.jpg`,
                "$description": card.customAttributes.description,
                "$releaseDate": card.customAttributes.releaseDate,
                "$energyType": card.customAttributes.energyType[0] ?? "",
                "$cardType": card.customAttributes.cardType[0] ?? "",
            }
            try {
                await dbRun(addCardSql, newCard)
            } catch (err) {
                console.log(err)
            }
            count++
        }
    }
    let relDateExp = releaseDate
    let relSeries = releaseDate
    if (relDateExp == null) {
        let date= new Date(missingData.expRelDates.find((value) => value.name === expantion.$name).releaseDate)
        relDateExp = date.toISOString()
    }
    if (relSeries == null) {
        let date = new Date(missingData.seriesRelDate.find((value) => value.name === expantion.$series).releaseDate)
        relSeries = date.toISOString()
    }
    try {
        await dbRun("UPDATE series SET releaseDate = $releaseDate WHERE name = $name", { "$releaseDate": relSeries, "$name": expantion.$series })
        await dbRun("UPDATE expansions SET releaseDate = $releaseDate, numberOfCards = $numberOfCards WHERE name = $name", { "$releaseDate": relDateExp, "$name": expantion.$name, "$numberOfCards": count })
    } catch (err) {
        console.log(err)
    }
    console.log(`Added ${count} ${expantion.$name} cards`)
}

function findTcgSetName(expName,  series, tcgSets) {
    let expNameNorm = (series === expName) ? normalizePOKE(expName)+"baseset" : normalizePOKE(expName)
    let name = searchNameMap(expName)

    if (name.length == 0) {
        name = tcgSets.filter((value) => normalizeTCG(value).includes(expNameNorm))
    }
    if (name.length == 0) {
        name = tcgSets.filter((value) => expNameNorm.includes(normalizeTCG(value)))
    }
    return (name != null && name.length != 0) ? JSON.stringify(name) : ["N/A"]
}

function searchNameMap(name){
    let newName = missingData.tcgNameMap.find((value) => value.name === name)
    return newName != null ? newName.tcgName : []
}

function normalizePOKE(name){
    return name.toLowerCase()
    .replaceAll(' ', '')
    .replaceAll('-', '')
    .replaceAll('&', '')
    .replaceAll(`'`, ``)
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll('and', '')
    .replaceAll(`mcdonaldscollection`, 'mcdonaldspromos')
    .replaceAll('promocards', 'promos')
    .replaceAll('wizardsofthecoast', 'wotc')
    .replaceAll('blackstarpromos', 'promos')
    .replaceAll(`diamondpearl`, `dp`)
    .replaceAll('bestofgame', 'bestof')
}

function normalizeTCG(name) {
    return name.toLowerCase()
        .replaceAll(' ', '')
        .replaceAll('-', '')
        .replaceAll('&', '')
        .replaceAll(`'`, ``)
        .replaceAll('(', '')
        .replaceAll(')', '')
        .replaceAll('and', '')
        .replaceAll('promocards', 'promos')
        .replaceAll('blackstarpromos', 'promos')
        .replaceAll(`diamondpearl`, `dp`)
}

function dbRun(statement, args) {
    return new Promise((resolve, reject) => {
        db.run(statement, args, (err) => {
            if (err) {
                console.error(statement + ":" + args + ":" + err)
                reject()
            }
            resolve()
        })
    })
}

function dbSelect(statement, args) {
    return new Promise((resolve, reject) => {
        const rows = [];
        db.each(statement, args, (err, row) => {
            if (err) {
                reject(err);
            }
            rows.push(row);
        }, (err, _) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        });
    });
}