import { CardSearch } from "../model/Card";
import axios from 'axios'
import { baseURL } from "../index";


export function search(page: number, term?: string, sets?: string[], rarity?: string[]): Promise<CardSearch> {
    return new Promise<CardSearch>(
        (resolve, reject) => {
            axios.get(`${baseURL}/cards/${page ?? 0}/?name=${term ?? ""}`).then(
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

