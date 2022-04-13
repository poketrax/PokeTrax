export class Card {
    public cardId: string
    public idTCGP: string
    public name : string
    public expIdTCGP: string
    public expName: string
    public expCardNumber : string
    public rarity: string
    public img: string
    public description?: string    
    public releaseDate?: string
    public energyType?: string
    public cardType?: string

    constructor(cardId: string, idTCGP: string, name:string, expId:string, expName:string, expCardNumber:string, rarity:string, img:string){
        this.cardId = cardId
        this.idTCGP = idTCGP
        this.name = name
        this.expIdTCGP = expId
        this.expName = expName
        this.expCardNumber = expCardNumber
        this.rarity = rarity
        this.img = img
    }
}