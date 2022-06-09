
import { CardSearch, Price, Card } from "../model/Card";
import axios from 'axios'
import { baseURL } from "../index";
import { Expansion } from "../model/Meta";
import { BsFillCircleFill, BsDiamondFill, BsStars } from "react-icons/bs"
import { IoStarOutline, IoStarSharp, IoStarHalfSharp } from "react-icons/io5"
import { CgPokemon } from "react-icons/cg"
import { from } from 'rxjs';
import { Collection } from "../model/Collection";
import { ProductList, SealedProduct } from "../model/SealedProduct";

export class DbState {
    public ready: boolean = false
    public updated: boolean = false
}

export function search(page: number, term?: string, sets?: string[], rarity?: string[], sort?: string): Promise<CardSearch> {
    return new Promise<CardSearch>(
        (resolve, reject) => {
            let url = new URL(`${baseURL}/cards/${page ?? 0}`)
            if (sets && sets.length !== 0) {
                url.searchParams.set(`expansions`, encodeURI(JSON.stringify(sets)))
            }
            if (term != null) {
                url.searchParams.set(`name`, term)
            }
            if (sort != null) {
                url.searchParams.set('sort', sort)
            }
            if (rarity != null && rarity.length !== 0) {
                url.searchParams.set(`rarities`, JSON.stringify(rarity))
            }
            axios.get(url.toString()).then(
                (res) => {
                    resolve(res.data)
                },
                (err) => {
                    reject(err)
                }
            )
        }
    )
}

export function searchProducts(page: number, searchTerm?: string, sort?: string): Promise<ProductList> {
    return new Promise(
        (resolve, reject) => {
            let url = new URL(`${baseURL}/sealed/${page}`)
            url.searchParams.set('name', searchTerm)
            url.searchParams.set('sort', sort)
            axios.get(url.toString())
                .then(
                    (res) => {
                        resolve(res.data)
                    },
                    (err) => {
                        console.log(err.body)
                        reject()
                    }
                )
        }
    )
}

export function getDbState(): Promise<DbState> {
    return new Promise(
        (resolve, reject) => {
            from(axios.get(`${baseURL}/dbstatus`).then(
                (res) => {
                    resolve(res.data)
                }
            ).catch(
                (err) => {
                    reject(err)
                })
            )
        }
    )
}

export function getCollections(): Promise<Array<Collection>> {
    return new Promise<Array<Collection>>(
        (resolve, reject) => {
            axios.get(`${baseURL}/collections`).then(
                (res) => {
                    resolve(res.data)
                }
            ).catch(
                (err) => {
                    reject(err.body)
                }
            )
        }
    )
}

export async function getCollectionCards(collection: string, page: number, searchVal?: string, rarity?: string[], sort?: string): Promise<CardSearch> {
    return new Promise<CardSearch>(
        (resolve, reject) => {
            if (collection === '') {
                resolve(new CardSearch())
            }
            let url = new URL(`${baseURL}/collections/${collection}/cards/${page ?? 0}`)
            if (searchVal != null) {
                url.searchParams.set(`name`, searchVal)
            }
            if (sort != null) {
                url.searchParams.set('sort', sort)
            }
            if (rarity != null && rarity.length !== 0) {
                url.searchParams.set(`rarities`, JSON.stringify(rarity))
            }
            axios.get(url.toString())
                .then(
                    (res) => {
                        resolve(res.data)
                    }
                ).catch(
                    (err) => {
                        reject(err)
                    }
                )
        }
    )
}

export function addCollection(name: string): Promise<any> {
    return new Promise<any>(
        (resolve, reject) => {
            axios.put(`${baseURL}/collections`, { name: name }).then(
                (_) => {
                    resolve("")
                }
            ).catch(
                (err) => {
                    reject(err)
                }
            )
        }
    )
}

export function deleteCollection(name: string): Promise<any> {
    return new Promise<any>(
        (resolve, reject) => {
            axios.delete(`${baseURL}/collections`, { data: { name: name } }).then(
                (_) => {
                    resolve("")
                }
            ).catch(
                (err) => {
                    reject(err)
                }
            )
        }
    )
}

export function deleteCardFromCollection(card: Card) {
    return new Promise<void>(
        (resolve, reject) => {
            axios.delete(
                `${baseURL}/collections/card`,
                { data: card }
            ).then(
                (res) => {
                    resolve()
                }
            ).catch(
                (err) => {
                    reject(err)
                }
            )
        }
    )
}

export async function addCardToCollection(card: Card) {
    return new Promise<void>(
        (resolve, reject) => {
            if (card.collection != null &&
                card.variant != null &&
                card.count != null) {
                axios.put(`${baseURL}/collections/card`, card).then(
                    (res) => {
                        resolve()
                    }
                ).catch(
                    (err) => {
                        reject(err)
                    }
                )
            } else {
                reject("missing data")
            }
        }
    )
}

export function getTCGPprice(card: Card): Promise<Price[]> {
    return new Promise<Price[]>(
        (reslove, reject) => {
            axios.post(`${baseURL}/price`, card).then(
                (res) => {
                    reslove(res.data)
                },
                (err) => {
                    reject(err)
                }
            )
        }
    )
}

export function getTCGPprices(card: Card, start: number, end: number): Promise<Price[]> {
    return new Promise<Price[]>(
        (reslove, reject) => {
            axios.post(`${baseURL}/price?start=${start}&end=${end}`, card).then(
                (res) => {
                    reslove(res.data)
                },
                (err) => {
                    reject(err)
                }
            )
        }
    )
}

export function expansions(): Promise<Expansion[]> {
    return new Promise<Expansion[]>(
        (resolve, reject) => {
            axios.get(`${baseURL}/expansions`).then(
                (res) => {
                    resolve(res.data)
                },
                (err) => {
                    reject(err)
                }
            )
        }
    )
}

export class Grade {
    public grader: string
    public grade: string
    public modifier?: string

    constructor(grader: string, grade: string, modifier?: string) {
        this.grade = grade
        this.grader = grader
        this.modifier = modifier
    }
}

const gradeRegEx = [
    /(PSA)-(1\.5|10|[1-9])-?(OC|MK|MC|ST|PD|OF)?/g,
    /(CGC)-(10|[1-9]\.?5?)-?(P|E)?/g,
    /(BGS)-(10|[1-9]\.?5?)-?(P)?/g,
    /(ACE)-(10|[1-9])/g
]
/**
 * returns parsed grade or null if invalid
 * @param grade 
 * @returns 
 */
export function parseGrade(grade: string): Grade | null {
    let normalGrade = grade.toUpperCase().trim()
    let parsedGrade = null
    for (let regex of gradeRegEx) {
        regex.lastIndex = 0
        let parts = regex.exec(normalGrade)
        if (parts != null) {
            parsedGrade = new Grade(parts[1], parts[2], parts[3])
        }
    }
    return parsedGrade
}

export async function rarities(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        axios.get(`${baseURL}/card/rarities`).then(
            (value) => {
                resolve(value.data)
            },
            (err) => {
                reject(err)
            }
        )

    })
}

function downloadURI(uri: string, name: string) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link.remove()
}

export function download(collection: string, type: string) {
    axios.get(`${baseURL}/collections/download/${collection}/${type}`).then(
        (res) => {
            let data = res.data
            if (type === 'JSON') {
                data = JSON.stringify(res.data, null, 1)
            }
            let extention = type.toLowerCase()
            extention = extention.split("-")[0]
            const blob = new Blob([data], { type: `application/${extention}` });
            const url = URL.createObjectURL(blob);
            downloadURI(url, `${collection}.${extention}`)
        }
    )
}

export async function renameCollection(collection: string, newName: string, update: (percent: number, done: boolean) => void) {
    let total = 0
    let processed = 0
    let pages = 0
    let i = 0

    addCollection(newName)
    do {
        try {
            let results = await getCollectionCards(collection, i)
            if (total === 0) {
                pages = Math.ceil(results.total / 25)
                total = results.total
            }
            for (let card of results.cards) {
                card.collection = newName
                addCardToCollection(card)
                processed++
            }
        }
        catch (err) {
            console.log(err)
        }
        i++
        update(processed / total, false)
    } while (i < pages)
    deleteCollection(collection)
    update(1, true)
}

export function openLink(type: string, product: Card | SealedProduct) {
    axios.post(`${baseURL}/openlink`, { type: type, card: product })
}

export function getCollectionValue(collection: string) {
    return axios.get(`${baseURL}/collections/${collection}/value`)
}

export function getRarity(rarity: string) {
    switch (rarity) {
        case "Rare":
            return (<IoStarSharp></IoStarSharp>)
        case "Holo Rare":
            return (<div className='flex justify-items-center items-center'><div>H</div><IoStarSharp></IoStarSharp></div>)
        case "Uncommon":
            return (<BsDiamondFill></BsDiamondFill>)
        case "Ultra Rare":
            return (<IoStarHalfSharp></IoStarHalfSharp>)
        case "Secret Rare":
            return (<div className='flex justify-items-center items-center'><div>S</div><IoStarOutline></IoStarOutline></div>)
        case "Amazing Rare":
            return (<img className='w-5 h-5' alt="" src={`./assests/amazing.svg`}></img>)
        case "Shiny Holo Rare":
            return (<div className='flex justify-items-center items-center'><BsStars></BsStars><IoStarSharp></IoStarSharp></div>)
        case "Prism Rare":
            return (<IoStarSharp></IoStarSharp>)
        case "Rare BREAK":
            return (<IoStarHalfSharp></IoStarHalfSharp>)
        case "Classic Collection":
            return (<IoStarHalfSharp></IoStarHalfSharp>)
        case "Rare Ace":
            return (<IoStarSharp></IoStarSharp>)
        case "Promo":
            return (<img className='w-5 h-5' alt="" src={`${baseURL}/expSymbol/Sword%20&%20Shield%20Promos`}></img>)
        case "Radiant Rare":
            return (<IoStarSharp></IoStarSharp>)
        default:
            return (<BsFillCircleFill></BsFillCircleFill>)
    }
}

export function getEnergy(energyType: string) {
    let _class = 'w-5 h-5 ml-2'
    switch (energyType) {
        case "Fire":
            return (<img className={_class} alt="" src={`./assests/fire.png`}></img>)
        case "Water":
            return (<img className={_class} alt="" src={`./assests/water.png`}></img>)
        case "Grass":
            return (<img className={_class} alt="" src={`./assests/grass.png`}></img>)
        case "Fighting":
            return (<img className={_class} alt="" src={`./assests/fighting.png`}></img>)
        case "Psychic":
            return (<img className={_class} alt="" src={`./assests/Psychic.png`}></img>)
        case "Lightning":
            return (<img className={_class} alt="" src={`./assests/electric.png`}></img>)
        case "Colorless":
            return (<img className={_class} alt="" src={`./assests/colorless.png`}></img>)
        case "Darkness":
            return (<img className={_class} alt="" src={`./assests/dark.png`}></img>)
        case "Metal":
            return (<img className={_class} alt="" src={`./assests/steel.png`}></img>)
        case "Dragon":
            return (<img className={_class} alt="" src={`./assests/dragon.png`}></img>)
        case "Fairy":
            return (<img className={_class} alt="" src={`./assests/fairy.png`}></img>)
        default:
            return (<CgPokemon className={_class}></CgPokemon>)
    }
}
