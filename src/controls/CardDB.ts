import { LowSync, JSONFileSync } from 'lowdb'
import * as jsdom from 'jsdom'
import { Expansion, Series, MetaData } from "../model/Meta"
import { Card } from "../model/Card"
import { timer } from "rxjs"
import axios from 'axios'
import * as fs from 'fs'
const XMLHttpRequest = require('xhr2');

//used to slow down requests as to not get us banned from tcgPlayer.
let addExpantions = new Array<Expansion>()

let metaAdapter = new JSONFileSync<MetaData>("./data/meta.json")
let metaDB = new LowSync<MetaData>(metaAdapter)

let adapter = new JSONFileSync<Array<Card>>("./data/cards.json")
let cardDB = new LowSync(adapter)

/**
 * Initializes Database with specified path and wether to nuke the exsisting database.
 * Mainly used for testing and reinitializing database.
 * @param metaPath path for meta data
 * @param cardsPath path for cards
 * @param nuke delete files before reading
 */
export function init(metaPath: string, cardsPath: string, nuke?: boolean) {
    if(nuke === true){
        fs.rmSync(metaPath)
        fs.rmSync(cardsPath)        
    }
    metaAdapter = new JSONFileSync<MetaData>(metaPath)
    metaDB = new LowSync<MetaData>(metaAdapter)
    adapter = new JSONFileSync<Array<Card>>(cardsPath)
    cardDB = new LowSync(adapter)
    readDataBase()
}

/**
 * Reads database uses standard file locations.
 */
export function readDataBase() {
    metaDB.read()
    metaDB.data ||= new MetaData()
    cardDB.read()
    cardDB.data ||= new Array<Card>()
}

/**
 * Checks for new sets will not overwrite old ones will only add new sets
 */
export function checkForSets() {
    const request = new XMLHttpRequest();
    request.open("GET", `https://www.pokellector.com/sets`)
    request.send()
    request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
            const { window } = new jsdom.JSDOM(request.responseText)
            const left = window.document.getElementById("columnLeft")
            const seriesName = left?.getElementsByTagName("h1")
            const seriesExp = left?.getElementsByClassName("buttonlisting")
            //cycle though series
            if (seriesName != null) {
                for (let i = 0; i < seriesName.length; i++) {
                    let series_name = seriesName[i].textContent?.replaceAll("Series", "").trim() || "RUHROH"
                    let series = metaDB.data?.series.find(({ name }) => name === series_name)
                    //create new series not found
                    if (series == null) {
                        series = new Series(series_name)
                        metaDB.data?.series.push(series)
                    }
                    //cycle though expansions looking for new ones
                    if (seriesExp != null) {
                        const expButtons = seriesExp[i].getElementsByClassName("button")
                        if (expButtons != null) {
                            for (let button of expButtons) {
                                let span = button.getElementsByTagName("span")[0]
                                let expName = span?.textContent?.trim()
                                let expFound = metaDB.data?.expansions.find(({ name }) => name === expName)
                                //search for expantion
                                if (expFound == null && expName != null) {
                                    let imgs = button.getElementsByTagName("img")
                                    let newExp = new Expansion(expName, imgs[0].src, imgs[1].src)
                                    metaDB.data?.expansions.push(newExp)
                                    addExpantions.push(newExp)
                                }
                            }
                        }
                    }

                }
                const pullExpThread = timer(500).subscribe(
                    () => {
                        let exp = addExpantions.pop()
                        if (exp != null) {
                            console.log(`Pulling ${exp.name}`)
                            pullCards(exp)
                        } else {
                            pullExpThread.unsubscribe()
                        }
                    }
                )
                metaDB.write()
            }
        }
    }

}

function pullCards(expantion: Expansion) {
    let request = JSON.parse(fs.readFileSync("set-request.json").toString())
    axios.post(`https://mpapi.tcgplayer.com/v2/search/request?q=${expantion.name}&isList=false`, request).then(
        (res) => {
            let count = 0
            for (let card of res.data.results[0].results) {
                let name = card.productName;
                if (name.contains("Code Card") === false) {
                    cardDB.data?.push(
                        {
                            "idTCGP": card.productId,
                            "name": name,
                            "setIdTCGP": card.setUrlName,
                            "setName": expantion.name,
                            "setCardNumber": card.customAttributes.number.split("/")[0],
                            "rarity": card.rarityName,
                            "img": `https://tcgplayer-cdn.tcgplayer.com/product/${card.productId.toFixed()}_200w.jpg`,
                            "description": card.customAttributes.description,
                            "releaseDate": card.customAttributes.releaseDate,
                            "stage": card.customAttributes.stage,
                            "energyType": card.customAttributes.energyType,
                            "cardType": card.customAttributes.cardType,
                            "cardTypeB": card.customAttributes.cardTypeB,
                            "resistance": card.customAttributes.resistance,
                            "weakness": card.customAttributes.weakness,
                            "flavorText": card.customAttributes.flavorText,
                            "attack1": card.customAttributes.attack1,
                            "attack2": card.customAttributes.attack2,
                            "attack3": card.customAttributes.attack3,
                            "attack4": card.customAttributes.attack4
                        }
                    )
                    count++
                }
            }
            cardDB.write()
            console.log(`Added ${count}/${expantion.count} ${expantion.name} cards`)
        }
    )
}

