import { v4 as uuidv4 } from 'uuid';
import { Card } from './Card';

export class Collection {
    public id: string = uuidv4()
    public name: string
    public icon?: string 
    public cards = new Array<Card>()

    constructor(name: string){
        this.name = name
    }
}