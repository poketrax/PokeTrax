import { v4 as uuidv4 } from 'uuid';

export class Collection {
    public id: string = uuidv4()
    public name: string
    public icon?: string 
    public cards: string[] = new Array<string>()

    constructor(name: string){
        this.name = name
    }
}