import React from 'react';
import { Card, Price } from '../model/Card'
import { baseURL } from '../index'
import { BsFillCircleFill, BsDiamondFill } from "react-icons/bs"
import { ImStarFull } from "react-icons/im"
import axios from 'axios'

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
                <div className='rounded-md border-grey-600 border-2 w-64 h-fit bg-gray-100 hover:shadow-2xl'>
                    <div className='h-8'>
                        <span className='pl-2 '>{this.props.card?.name}</span>
                    </div>
                    <div className='flex justify-items-center'>
                        <img className='w-64' src={baseURL + "/cardImg/" + this.props.card?.cardId} />
                    </div>
                    <div className='h-8 flex justify-items-center items-center'>
                        <div className='flex justify-items-center items-center h-8 w-8 ml-2'>
                            <img className='h-6' src={baseURL + "/expSymbol/" + this.props.card?.expName} />
                        </div>
                        <div className='grow'></div>
                            <a className='text-blue-600 visited:text-red-600' href={'https://tcgplayer.com/product/'+this.props.card?.idTCGP}>TCG Player</a>
                        <div className='grow'></div>
                        <div className='flex justify-items-center items-center h-8 w-8'>
                            {this.getRarity(this.props.card?.rarity ?? "")}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    private getPrice(): string{
        if(this.state.prices.length != 0){
             return this.state.prices[0].marketPrice.toString()
        }else{
            return '-.--'
        }
    }

    private getRarity(rarity: string) {
        switch (rarity) {
            case "Rare":
                return (<ImStarFull></ImStarFull>)
            case "Holo Rare":
                return (<div className='flex justify-items-center items-center'><div>H</div><ImStarFull></ImStarFull></div>)
            case "Uncommon":
                return (<BsDiamondFill></BsDiamondFill>)
            default:
                return (<BsFillCircleFill></BsFillCircleFill>)
        }
    }
}