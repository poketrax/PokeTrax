

import { Card, CardSearchResults, Price } from './Card';
import type { Expansion, Series } from './CardMeta';
import { writable } from 'svelte/store';
import { baseURL } from './Utils';

export class SearchTerms {
    public keyword: string = ""
    public selectedSets: Array<string> = []
    public selectedRarities: Array<string> = []
    public sort: string = ""
}

export class DbState {
    public ready: boolean = false
    public updated: boolean = false
    public version: string = "0.0.0"
    public error: string = ""
}

/////////////
/*Meta data*/
/////////////

//Set options
export const setStore = writable(new Array<Expansion>)
//Series options
export const seriesStore = writable(new Array<Series>)
//Rarity options
export const rarityStore = writable(new Array<string>)
//database status (ensures db is ready and not updating)
export const dbStatus = writable(new DbState())

////////////////////////////////
/*Global card search variables*/
////////////////////////////////

//List of sets(expantions) selected
export const selectedSetsStore = writable(new Array<string>)
export let selectedSets = [];
selectedSetsStore.subscribe((val) => selectedSets = val)
//List of Card Rarities selected
export const selectedRaritiesStore = writable(new Array<string>)
export let selectedRarities = []
selectedRaritiesStore.subscribe((val) => selectedRarities = val)
//Search term entered
export const searchTermStore = writable("")
export let searchTerm = ""
searchTermStore.subscribe((val) => searchTerm = val)
//Sort button pressed
export const sortStore = writable("")
export let sort = ""
sortStore.subscribe((val) => sort = val)
//Card Results
export const cardResultStore = writable(new CardSearchResults())
//Selected display option [case, table]
export const cardSearchDisplay = writable("grid")
//Admin (Mod)
export const auth_exp = writable(0)

export function executeCardSearch(){
    let url = new URL(`${baseURL}/gcp/pokemon/cards`)
    if (selectedSets.length !== 0) {
        url.searchParams.set(`expansions`, encodeURI(JSON.stringify(selectedSets)))
    }
    if (searchTerm && searchTerm !== "") {
        let term = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
        url.searchParams.set(`name`, term)
    }
    if (selectedRarities && selectedRarities.length !== 0) {
        url.searchParams.set(`rarities`, encodeURI(JSON.stringify(selectedRarities)))
    }
    fetch(url.toString())
        .then(res => res.json())
        .then(
            (data) => {
                if(sort && sort !== ""){
                    let result = new CardSearchResults();
                    result.cards = sortSearch(sort, data.cards);
                    cardResultStore.set(result)
                }else{
                    cardResultStore.set(data)
                }
            },
            (err) => {
                console.log(err)
            }
        )
}

function sortSearch(sort: string, cardList: Card[]): Card[] {
    switch(sort){
        case "name":
            return cardList;
        case "setNumber":
            return cardList.sort((a,b) => a.expCardNumber < b.expCardNumber ? -1 : 1);
        case "pokedex":
            return cardList.sort((a,b) => a.pokedex < b.pokedex ? -1 : 1);
        case "priceDSC":
            return cardList.sort((a,b) => a.price < b.price ? -1 : 1);
        case "priceASC":
            return cardList.sort((a,b) => a.price > b.price ? -1 : 1);
        case "dateDSC":
            return cardList.sort((a,b) => {
                let aDate = new Date(a.releaseDate);
                let bDate = new Date(b.releaseDate);
                return aDate.getTime() < bDate.getTime() ? -1 : 1
            });
        case "dateASC":
            return cardList.sort((a,b) => {
                let aDate = new Date(a.releaseDate);
                let bDate = new Date(b.releaseDate);
                return aDate.getTime() > bDate.getTime() ? -1 : 1
            });
        default:
            return cardList;
    }
}

export function initMod() {
    fetch(`${baseURL}/gcp/auth/exp`)
        .then(res => res.json())
        .then(data => auth_exp.set(data.exp))
        .catch(e => console.log(`failed to talk to get login status ${e}`))
}

/**
 * Get set expantions
 * @returns 
 */
function expansions(): Promise<Expansion[]> {
    return new Promise<Expansion[]>(
        (resolve, reject) => {
            fetch(`${baseURL}/pokemon/expansions`)
                .then(res => res.json())
                .then(data => resolve(data))
                .catch(err => reject(err))
        }
    )
}

/**
 * Get Series
 * @returns 
 */
function series(): Promise<Series[]> {
    return new Promise<Series[]>(
        (resolve, reject) => {
            fetch(`${baseURL}/pokemon/series`)
                .then(res => res.json())
                .then(data => resolve(data))
                .catch(err => reject(err))
        }
    )
}

/**
 * Get List of Pokemon Rarities
 * @returns List of rarities
 */
function rarities(): Promise<string[]> {
    return new Promise<string[]>(
        (resolve, reject) => {
            fetch(`${baseURL}/pokemon/card/rarities`)
                .then(res => res.json())
                .then(data => resolve(data))
                .catch(err => reject(err))
        }
    )
}