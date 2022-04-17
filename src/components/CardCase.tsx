import React from 'react';
import { Card, Price } from '../model/Card'
import { baseURL } from '../index'
import { getRarity } from '../controls/CardDB';
import { CgPokemon } from "react-icons/cg"
import Paper from '@mui/material/Paper';

class Props {
    public card: Card | null = null
}

class State {
    public prices = new Array<Price>()
}

export class CardCase extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
    }
    render() {
        return (
            <div className='flex justify-center'>
                <Paper elevation={3} className='rounded-md w-64 h-fit hover:shadow-2xl hover:hover:bg-red-600 hover:text-white'>
                    <div className='h-8 flex items-center'>
                        {this.getEnergy(this.props.card?.energyType ?? "")}
                        <span className='pl-2 truncate' >{this.props.card?.name}</span>
                    </div>
                    <div className='flex justify-items-center'>
                        <img className='w-64' src={baseURL + "/cardImg/" + this.props.card?.cardId} />
                    </div>
                    <div className='h-8 flex justify-items-center items-center'>
                        <div className='flex justify-items-center items-center h-8 w-8 ml-2'>
                            <img className='h-6' src={baseURL + "/expSymbol/" + this.props.card?.expName} />
                        </div>
                        <div className='grow'></div>
                        <a className='text-blue-600' href={'https://tcgplayer.com/product/' + this.props.card?.idTCGP}></a>
                        <div className='grow'></div>
                        <div>{this.props.card?.expCardNumber}</div>
                        <div className='grow'></div>
                        <div className='flex justify-items-center items-center h-8 w-8'>
                            {getRarity(this.props.card?.rarity ?? "")}
                        </div>
                    </div>
                </Paper>
            </div>
        )
    }

    private getPrice(): string {
        if (this.state.prices.length != 0) {
            return this.state.prices[0].marketPrice.toString()
        } else {
            return '-.--'
        }
    }

    private getEnergy(energyType: string) {
        let _class = 'w-5 h-5 ml-2'
        switch (energyType) {
            case "Fire":
                return (<img className={_class} src={`./assests/fire.png`}></img>)
            case "Water":
                return (<img className={_class} src={`./assests/water.png`}></img>)
            case "Grass":
                return (<img className={_class} src={`./assests/grass.png`}></img>)
            case "Fighting":
                return (<img className={_class} src={`./assests/fighting.png`}></img>)
            case "Psychic":
                return (<img className={_class} src={`./assests/Psychic.png`}></img>)
            case "Lightning":
                return (<img className={_class} src={`./assests/electric.png`}></img>)
            case "Colorless":
                return (<img className={_class} src={`./assests/colorless.png`}></img>)
            case "Darkness":
                return (<img className={_class} src={`./assests/dark.png`}></img>)
            case "Metal":
                return (<img className={_class} src={`./assests/steel.png`}></img>)
            case "Dragon":
                return (<img className={_class} src={`./assests/dragon.png`}></img>)
            case "Fairy":
                return (<img className={_class} src={`./assests/fairy.png`}></img>)
            default:
                return (<CgPokemon className={_class}></CgPokemon>)
        }
    }


}