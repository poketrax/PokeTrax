import type { Expansion } from "./CardMeta";
import { writable } from 'svelte/store';
import type { Card } from "./Card";
import { initCardStore } from "./CardSearchStore";
import { initMod } from "./ModDataStore";
import { initCollectionStore } from "./CollectionStore";

export const baseURL = "http://localhost:3131"

export interface PaginatedResults {
    count: number;
}

/**
 * Main Page
 * [loading, cards, sets, sealedProduct, collections]
 */
export const page = writable("loading")
/** DB status */


export function formatExpansionNumber(expNumber: string, expName: string): Promise<string> {
    return new Promise<string>(
        (resolve, _) => {
            let num = Number.parseInt(expNumber)
            let value = isNaN(num) ? expNumber : num.toString()
            fetch(`${baseURL}/pokemon/expansion/${encodeURIComponent(expName)}`)
                .then(res => res.json())
                .then((exp: Expansion) => {
                    resolve(`${value}/${exp.numberOfCards}`)
                })
                .catch(_ => resolve(value));
        }
    )
}

export function init() {
    initCardStore();
    initMod();
    initCollectionStore();
}

export function getTextColorBgContrast(hexcolor){
		// If a leading # is provided, remove it
        if (hexcolor.slice(0, 1) === '#') {
            hexcolor = hexcolor.slice(1);
        }
    
        // Convert to RGB value
        var r = parseInt(hexcolor.substr(0,2),16);
        var g = parseInt(hexcolor.substr(2,2),16);
        var b = parseInt(hexcolor.substr(4,2),16);
    
        // Get YIQ ratio
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
        // Check contrast
        return (yiq >= 128) ? 'black' : 'white';
}

export function getHolo(card: Card) {
    let holo = "basic";
    if (card.name.includes("Secret")) {
        return "rare rainbow"
    }else if (card.name.includes("VMAX") || card.name.includes("VSTAR")) {
        return "rare holo vmax"
    } else if (card.name.includes("Full Art")) {
        return "rare holo vmax"
    } else if (card.rarity === "Holo Rare") {
        return "rare holo";
    } else if (card.name.includes(" V")) {
        return "rare holo v"
    } else if (card.name.includes("Radiant")) {
        return "radiant"
    } else if (card.expCardNumber.includes("TG")) {
        return "rare holo v"
    }
    return holo;
}

export function formatDate(dateString: string) {
    let date = new Date(Date.parse(dateString));
    return date.toLocaleDateString();
}

export function formatEnergy(card: Card) {
    return (card.energyType == null || card.energyType == "") ? "trainer" : card.energyType.toLowerCase()
}

export function formatPrice(price: number | undefined) {
    let formater = new Intl.NumberFormat('EN',
        {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
            maximumSignificantDigits: 3
        })
    return price == null ? "-.--" : formater.format(price)
}

export function objEq(v1, v2): boolean {
    let incJSON = JSON.stringify(v1);
    let currJSON = JSON.stringify(v2);
    return incJSON === currJSON;
}

