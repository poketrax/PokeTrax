
import { CardSearch, Price, Card } from "../model/Card";
import axios from 'axios'
import { baseURL } from "../index";
import { Expansion } from "../model/Meta";
import { BsFillCircleFill, BsDiamondFill, BsStars } from "react-icons/bs"
import { IoStarOutline, IoStarSharp, IoStarHalfSharp } from "react-icons/io5"

export function search(page: number, term?: string, sets?: Expansion[], rarity?: string[]): Promise<CardSearch> {
    return new Promise<CardSearch>(
        (resolve, reject) => {
            let exps = JSON.stringify(sets?.map((value) => value.name) ?? [])
            let url = new URL(`${baseURL}/cards/${page ?? 0}`)
            if (exps.length != 0) {
                url.searchParams.set(`expansions`, exps)
            }
            if (term != null) {
                url.searchParams.set(`name`, term)
            }
            if(rarity != null && rarity.length != 0){
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

export function getTCGPprice(card: Card): Promise<Price[]>{
    return new Promise(
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

export const rarities = [
    "Common",
    "Uncommon",
    "Rare",
    "Promo",
    "Holo Rare",
    "Ultra Rare",
    "Secret Rare",
    "Code Card",
    "Shiny Holo Rare",
    "Prism Rare",
    "Rare BREAK",
    "Classic Collection",
    "Rare Ace",
    "Amazing Rare"
]

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
            return (<img className='w-5 h-5' src={`./assests/amazing.svg`}></img>)
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
            return (<img className='w-5 h-5' src={`${baseURL}/expSymbol/Sword%20&%20Shield%20Promos`}></img>)
        default:
            return (<BsFillCircleFill></BsFillCircleFill>)
    }
}
