export class Card {
    public id: string
    public name : string
    public setId: string
    public setName: string
    public setCardNumber : string
    public rarity: string
    public img: string
    public description: string    
    public releaseDate: string
    public stage?: null
    public energyType: string[] = new Array()
    public cardType: string[] = new Array()
    public cardTypeB?: string
    public resistance?: string
    public weakness?: string
    public flavorText?: string
    public attack1?: string
    public attack2?: string
    public attack3?: string
    public attack4?: string

    constructor(id: string, name:string, setId:string, setName:string, setCardNumber:string, rarity:string, img:string, description:string, releaseDate:string){
        this.id = id
        this.name = name
        this.setId = setId
        this.setName = setName
        this.setCardNumber = setCardNumber
        this.rarity = rarity
        this.img = img
        this.description = description
        this.releaseDate = releaseDate
    }
}