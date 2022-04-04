export class Expansion{
    public name: string
    public count: number = 0
    public logoURL: string
    public symbolURL: string

    constructor(name: string, logo: string, symbol: string){
        this.name = name
        this.logoURL = logo
        this.symbolURL = symbol
    }

    public getId(): string{
       return this.name.toLowerCase().replace(" ", "-")
    }
}

export class Series{
    public name : string
    public sets : Array<string> = new Array()

    constructor(name: string){
        this.name = name
    }
}

export class MetaData{
    public expansions: Array<Expansion> = new Array()
    public series: Array<Series> = new Array()
}