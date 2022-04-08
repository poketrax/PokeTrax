export class Expansion{
    public name: string
    public series: string
    public tcgName: string = ""
    public pokellectorSet: string = ""
    public count: number = 0
    public logoURL: string
    public symbolURL: string
    public cards = new Array<string>()

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