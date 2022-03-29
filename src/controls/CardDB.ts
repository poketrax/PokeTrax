import { Set } from '../model/Set'
import { Data } from "../model/Data"
import { Card } from "../model/Card"
import axios from 'axios'
import fs from 'fs'
import { JSONFileSync, LowSync } from 'lowdb'

const adapter = new JSONFileSync<Data>("./data/database.json")
const db = new LowSync<Data>(adapter)
db.read()
export function checkForSets() {
    let request = JSON.parse(fs.readFileSync("./data/set-request.json").toString())
    axios.post('https://mpapi.tcgplayer.com/v2/search/request?q=&isList=false', request).then(
        (res) => {
            let newSets = new Array<Set>()
            for (let set of res.data.results[0].aggregations.setName) {
                let found = db.data?.sets.find((value) => value.id === set.urlValue)
                if (found == null) {
                    newSets.push(new Set(set.urlValue, set.value, set.count))
                }
            }
            for (let set of newSets) {
                db.data?.sets.push(set)
                db.write()
                pullCards(set)
            }
        }
    )
}

async function pullCards(set: Set) {
    let request = JSON.parse(fs.readFileSync("./data/set-request.json").toString())
    request.filters.setName.push(set.id)
    axios.post('https://mpapi.tcgplayer.com/v2/search/request?q=&isList=false', request).then(
        (res) => {
            for (let card of res.data.results[0].results) {
                let name = card.productName;
                db.data?.cards.push(
                    {
                        "id": `${name.replaceAll(" ", "-")}-(${set}-${card.customAttributes.number})`,
                        "name": name,
                        "setId": set.id,
                        "setName": set.name,
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
            }
            db.write()
        }
    )
}