import React from 'react';
import { baseURL } from '../index'
import { Card, Price } from '../model/Card'
import { Line } from 'react-chartjs-2'
import { getTCGPprices } from "../controls/CardDB"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
interface Props {
    card: Card
}

class State {
    public inProg = false
    public imgLoaded = false
    public prices = new Array<Price>()
    public start: number

    constructor() {
        let _start = new Date(Date.now())
        _start.setMonth(_start.getMonth() - 1)
        this.start = _start.getTime()

    }
}

export class CardDialog extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = new State()

        getTCGPprices(props.card, this.state.start, Date.now())
            .then(
                (value) => {
                    this.setState({ ...this.state, prices: value })
                }
            )
    }
    private getLabels() {
        if (this.state.prices.length != 0) {
            let variant = this.state.prices[0].variant
            if (variant === this.state.prices[1].variant) {
                return this.state.prices.map((price) => {
                    let date = new Date(price.date)
                    return `${date.getMonth()}/${date.getDate()}`
                })
            } else {
                return this.state.prices
                    .filter((price) => price.variant === variant)
                    .map((price) => {
                        let date = new Date(price.date)
                        return `${date.getMonth()}/${date.getDate()}`
                    })
            }
        } else {
            return []
        }
    }

    private getDataSet(){
        if (this.state.prices.length != 0) {
            if (this.state.prices[0].variant === this.state.prices[1].variant) {
                return [{
                    label: this.state.prices[0].variant,
                    data: this.state.prices.map((price) => price.price),
                    borderColor: 'rgb(255, 0, 0)',
                    backgroundColor: 'rgb(255, 0, 0)',
                }]
            } else {
                return [
                    this.getSubDataSet(0, 'rgb(255, 0, 0)'),
                    this.getSubDataSet(1, 'rgb(0, 0, 255)')
                ]
            }
        } else {
            return []
        }
    }

    private getSubDataSet(set: number, color: string) {
        let variant = this.state.prices[set].variant
        return {
            label: variant,
            data: this.state.prices
                .filter((price) => price.variant === variant)
                .map((price) => price.price),
            borderColor: color,
            backgroundColor: color,
        }
    }

    render() {
        return (
            <div className='flex'>
                <div className='p-4 pr-2'>
                    <img className='rounded-xl w-96'
                        style={{ visibility: this.state.imgLoaded ? 'visible' : 'hidden' }}
                        src={baseURL + "/cardImg/" + this.props.card?.cardId}
                        alt=""
                        onLoad={() => this.setState({ ...this.state, imgLoaded: true })}
                        onError={(ev) => { if (ev.target instanceof HTMLImageElement) ev.target.src = './assests/pokemon-back.png' }}
                    />

                    <div className=''> </div>
                </div>
                <div className='p-4 pl-2'>
                    <div className='w-96'>
                        <Line
                            data={{
                                labels: this.getLabels(),
                                datasets: this.getDataSet(),
                            }}
                        />
                    </div>
                    <div className="text-2xl" >Details</div>
                    <table className='w-96 border-2'>
                        <tr className="bg-slate-200">
                            <td>Expansion</td>
                            <td>{this.props.card.expName} - {this.props.card.expCardNumber}</td>
                        </tr>
                        <tr>
                            <td>Rarity</td>
                            <td>{this.props.card.rarity}</td>
                        </tr>
                        <tr className="bg-slate-200">
                            <td>Card Type</td>
                            <td>{this.props.card.cardType}</td>
                        </tr>
                        <tr>
                            <td>Energy Type</td>
                            <td>{this.props.card.energyType}</td>
                        </tr>
                    </table>
                </div>
            </div>
        )
    }
}