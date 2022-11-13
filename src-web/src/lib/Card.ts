import type { PaginatedResults } from "./Utils"

export class Card {
    public cardId: string
    public idTCGP: number
    public name : string
    public expIdTCGP: string
    public expCodeTCGP?: string
    public expName: string
    public expCardNumber : string
    public rarity: string
    public price?: number
    public pokedex?: number
    public releaseDate?: string
    public energyType?: string
    public cardType?: string
    public tags?: string[]
    public variant?: string
    public paid?: number
    public count? : number
    public grade? : string
    public variants? : string[]

    constructor(cardId: string, idTCGP: number, name:string, expId:string, expName:string, expCardNumber:string, rarity:string){
        this.cardId = cardId
        this.idTCGP = idTCGP
        this.name = name
        this.expIdTCGP = expId
        this.expName = expName
        this.expCardNumber = expCardNumber
        this.rarity = rarity
    }
}

export class Price {
    public date: number
    public cardId: string
    public variant: string 
    public vendor: string
    public price: number

    constructor(date: number, cardId: string, variant: string, vendor: string, price: number){
        this.date = date
        this.cardId = cardId
        this.variant = variant
        this.vendor = vendor
        this.price = price
    }
}

export class CardSearchResults implements PaginatedResults {
    public count: number = 0;
    public cards: Array<Card> = new Array<Card>()
}

export class LinkRequest{
    public type: string
    public card: Card

    constructor(type: string, card: Card){
        this.card = card
        this.type = type
    }
}