export class Card {
    public cardId: string
    public idTCGP: string
    public name : string
    public expIdTCGP: string
    public expName: string
    public expCardNumber : string
    public rarity: string
    public price = new Array<Price>()
    public releaseDate?: string
    public energyType?: string
    public cardType?: string

    constructor(cardId: string, idTCGP: string, name:string, expId:string, expName:string, expCardNumber:string, rarity:string){
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
    public printingType: string
    public marketPrice: number
    public buylistMarketPrice?: number 
    public listedMedianPrice?: number

    constructor(printingType: string, marketPrice: number){
        this.printingType = printingType
        this.marketPrice = marketPrice
    }
}

export class CardSearch {
    public total: number = 0
    public cards: Card[] = new Array()
}