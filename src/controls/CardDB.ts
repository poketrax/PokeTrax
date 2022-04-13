
//used to slow down requests as to not get us banned from tcgPlaye
export class DBMessage {
    public message: string
    public progress: number

    constructor(message: string, progress: number) {
        this.message = message
        this.progress = progress
    }
}
export class CardDB {

}