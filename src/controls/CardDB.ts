import * as jsdom from 'jsdom'
import { Expansion } from "../model/Meta"
import { Card } from "../model/Card"
import { timer, Subject } from "rxjs"
import axios from 'axios'
import * as fs from 'fs'
const XMLHttpRequest = require('xhr2');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

//used to slow down requests as to not get us banned from tcgPlayer.

export class DBMessage {
    public message: string
    public progress: number

    constructor(message: string, progress: number) {
        this.message = message
        this.progress = progress
    }
}
export class CardDB {
    private metaAdapter: any;
    private metaDB: any;
    private adapter: any;
    private cardDB: any;
    public progress = new Subject<DBMessage>()

    /**
     * Initializes Database with specified path and wether to nuke the exsisting database.
     * Mainly used for testing and reinitializing database.
     * @param metaPath path for meta data
     * @param cardsPath path for cards
     * @param nuke delete files before reading
     */
    constructor(dataPath: string, nuke?: boolean) {
        let cardsFile = `${dataPath}/cards.json`
        let metaFile = `${dataPath}/meta.json`
        if (fs.existsSync(dataPath) === false) {
            fs.mkdirSync(dataPath, { recursive: true })
        }
        if (nuke === true) {
            if (fs.existsSync(cardsFile)) {
                fs.rmSync(cardsFile)
            }
            if (fs.existsSync(metaFile)) {
                fs.rmSync(metaFile)
            }
        }
        this.metaAdapter = new FileSync(metaFile)
        this.metaDB = new low(this.metaAdapter)
        this.adapter = new FileSync(cardsFile)
        this.cardDB = new low(this.adapter)
        this.metaDB.defaults({ series: [], expansions: [], cardTypes: [], rarities: [] }).write()
        this.cardDB.defaults({ cards: [] }).write()
    }
    /**
     * Checks for new sets will not overwrite old ones will only add new sets
     */
    public async checkForSets(): Promise<void> {
        //Get rarities and card types from tcgplayer
        let requestTcgSets = JSON.parse(this.tcgRequest)
        let tcgPlayerSets = Array<string>()
        await axios.post(`https://mpapi.tcgplayer.com/v2/search/request?q=&isList=false`, requestTcgSets).then(
            (res) => {
                this.metaDB.set('rarities', res.data.results[0].aggregations.rarityName.map((rare: any) => rare.value))
                this.metaDB.set('cardType', res.data.results[0].aggregations.cardType.map((type: any) => type.value))
                res.data.results[0].aggregations.setName.forEach(
                    (element: any) => {
                        tcgPlayerSets.push(element.urlValue)
                    })
            }
        )
        //scrap series from pokellector
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
                    let series = new Array<string>()
                    let exps = new Array<Expansion>()
                    for (let i = 0; i < seriesName.length; i++) {
                        let series_name = seriesName[i].textContent?.replaceAll("Series", "").trim() || "n/a"
                        //create new series not found
                        if (series_name != null) {
                            series.push(series_name)
                        }
                        //cycle though expansions looking for new ones
                        if (seriesExp != null) {
                            const expButtons = seriesExp[i].getElementsByClassName("button")
                            if (expButtons != null) {
                                for (let button of expButtons) {
                                    let span = button.getElementsByTagName("span")[0]
                                    let expName = span?.textContent?.trim()
                                    let expFound = this.metaDB.get("expansions").find((exp: Expansion) => exp.name === expName).value()
                                    //search for expantion
                                    if (expFound == null && expName != null) {
                                        let imgs = button.getElementsByTagName("img")
                                        let newExp = new Expansion(expName, series_name, imgs[0].src, imgs[1].src)
                                        let tcgName = this.findTcgSetName(expName, tcgPlayerSets)
                                        newExp.tcgName = tcgName 
                                        this.metaDB.get("expansions").push(newExp).write()
                                        exps.push(newExp)
                                    }
                                }
                            }
                        }
                    }
                    this.metaDB.set("series", series).write()
                    this.pullCardsSlowly(exps)
                }
            }
        }
    }

    private tcgRequest = `{
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

    public pullCardsSlowly(exps: Array<Expansion>,) {
        let total = exps.length
        const pullExpThread = timer(100).subscribe(
            () => {
                let exp = exps.pop()
                if (exp != null) {
                    console.log(`Pulling ${exp.name} `)
                    if(exp.tcgName === 'N/A'){
                        this.pullCardsPokellecotor(exp)
                    }else{
                        this.pullCardsTCGP(exp)
                    }
                } else {
                    pullExpThread.unsubscribe()
                }
            }
        )
    }

    //Pull cards from pokellector
    public pullCardsPokellecotor(expantion: Expansion): void {
        console.log("blma")
    }

    //Pull cards from tcg player
    public pullCardsTCGP(expantion: Expansion, ): void {
        let request = JSON.parse(this.tcgRequest)
        request.filters.term.setName.push(expantion.tcgName)
        axios.post(`https://mpapi.tcgplayer.com/v2/search/request?q=&isList=false`, request).then(
            (res) => {
                let count = 0
                let cards = new Array<Card>()
                for (let card of res.data.results[0].results) {
                    let name = card.productName;
                    if (name.includes("Code Card") === false) {
                        let newCard : Card = {
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
                        this.cardDB.get('cards').push(newCard).write()
                        cards.push(newCard)    
                        count++
                    }
                }
                this.metaDB.get('expansions').find((value: Expansion) => value.name === expantion.name).set("cards", cards).write()
                console.log(`Added ${count} ${expantion.name} cards`)
                this.progress.next(new DBMessage(`Adding ${count} cards from ${expantion.name}`, 0))
            }
        )
    }

    private findTcgSetName(expName: string, tcgSets: string[]): string {
        let expNameNorm = this.normalize(expName)
        let name = tcgSets.find((value) => { return this.normalize(value) === expNameNorm})
        if (name == null) {
            name = tcgSets.find((value) => this.normalize(value).includes(expNameNorm))
        }
        if(name == null) {
            name = tcgSets.find((value) => expNameNorm.includes(this.normalize(value)))
        }
        return name || "N/A"
    }

    public normalize(name: string): string {
        return name.toLowerCase()
        .replaceAll(' ', '')
        .replaceAll('-', '')
        .replaceAll('&', '')
        .replaceAll(`'`,``)
        .replaceAll('(', '')
        .replaceAll(')','')
        .replaceAll('and', '')
        .replaceAll(`sm`, `sunmoon`)
        .replaceAll(`mcdonaldscollection`, 'mcdonaldspromos')
        .replaceAll('promocards', 'promos')
        .replaceAll('wizardsofthecoast', 'wotc')
        .replaceAll('blackstarpromos', 'promos')
        .replaceAll(`diamondpearl`, `dp`)
        .replaceAll('bestofgame', 'bestof')
    }
    
    public getSeries(): string[]{
        return this.metaDB.get('series').value()
    }

    public getExpantions(): Expansion[]{
        return this.metaDB.get('expansions').value()
    }

}








