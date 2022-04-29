import { Card } from './Card';

export class Collection {
    public id: number 
    public name: string
    public icon?: string 
    public cards = new Array<Card>()

    constructor(id: number, name: string){
        this.id = id
        this.name = name
    }
}