export class SealedProduct {
    public name: string
    public price?: number
    public expIdTCGP: string
    public expName: string
    public type?: string
    public collection?: string
    public img?: string 
    public paid?: number
    public count?: number

    constructor(name: string, expName: string, expIdTCGP: string){
        this.name = name
        this.expIdTCGP = expIdTCGP
        this.expName = expName
    }
}

export class SealedPrice {
    public name: string
    public date: string
    public vendor: string
    public price?: number

    constructor(name: string, date: string, vendor: string, price?: number){
        this.name = name
        this.date = date
        this.vendor = vendor
        this.price = price
    }
}

export class ProductList {
    public total: number = 0
    public products: SealedProduct[] = []
}