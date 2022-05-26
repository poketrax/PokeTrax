export class SealedProduct {
    public name: string
    public price?: number
    public expIdTCGP: string
    public expName: string
    public type?: string
    public img?: string 

    constructor(name: string, expName: string, expIdTCGP: string){
        this.name = name
        this.expIdTCGP = expIdTCGP
        this.expName = expName
    }
}