export class Expansion{
    public name: string
    public series: string
    public tcgName: string = ""
    public pokellectorSet: string = ""
    public numberOfCards: number = 0
    public logoURL: string
    public symbolURL: string

    constructor(name: string, series: string, logo: string, symbol: string){
        this.name = name
        this.series = series
        this.logoURL = logo
        this.symbolURL = symbol
    }

    public getId(): string{
       return this.name.toLowerCase().replace(" ", "-")
    }
}

export class Series {
    public name: string
    public releaseDate: string

    constructor(name: string, releaseDate: string){
        this.name =  name
        this.releaseDate = releaseDate
    }
}