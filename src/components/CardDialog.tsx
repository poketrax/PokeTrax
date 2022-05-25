import React from 'react';
import { baseURL } from '../index'
import { Card, Price } from '../model/Card'
import {
    VictoryChart,
    VictoryLine,
    VictoryScatter,
    VictoryTheme,
    VictoryTooltip,
    VictoryZoomContainer
} from 'victory'
import { getTCGPprices } from "../controls/CardDB"
interface Props {
    card: Card
    price?: string | JSX.Element
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

    private getLine(variant: string, color: string) : JSX.Element[] {
        let items = new Array<JSX.Element>()
        let _prices = this.state.prices
        .filter((val) => val.variant === variant)
        if (_prices.length !== 0) {
            let data = _prices.map((value) => { return { x: new Date(value.date), y: value.price, label: `${variant}: $${value.price.toFixed(2)}` } })
            items.push(
                <VictoryLine
                    style={{ 
                        data: { stroke: color },
                        parent: { border: "1px solid #ccc" }
                    }}
                    interpolation="natural"
                    data={data}
                    labelComponent={<VictoryTooltip/>}
                />
            )
            items.push(
                <VictoryScatter data={data} labelComponent={<VictoryTooltip/>}/>
            )
        }
        return items
    }

    private getLines() {
        let colors = ["#ff0000", "#0000ff", "#00ff00"]
        let variants = JSON.parse(this.props.card.variants ?? '[]')
        let items = []
        for (let i = 0; i < variants.length; i++) {
            items.push(this.getLine(variants[i], colors[i]))
        }
        return items
    }

    private getTableRows() {
        let items = []
        let bg = false // used to create interlaced pattern 

        if (this.props.card.energyType != null &&
            this.props.card.energyType !== "") {
            items.push(
                <tr className={`${bg ? 'bg-slate-200' : ''}`}>
                    <td>Energy Type</td>
                    <td id="td-energy">{this.props.card.energyType}</td>
                </tr>
            )
            bg = !bg
        }
        if (this.props.card.variant != null &&
            this.props.card.variant !== "") {
            items.push(
                <tr className={`${bg ? 'bg-slate-200' : ''}`}>
                    <td>Variant</td>
                    <td id="td-variant">{this.props.card.variant}</td>
                </tr>
            )
            bg = !bg
        }
        if (this.props.card.paid != null &&
            this.props.card.paid !== 0) {
            items.push(
                <tr className={`${bg ? 'bg-slate-200' : ''}`}>
                    <td>Price Paid</td>
                    <td id="td-paid">{this.props.card.paid}</td>
                </tr>
            )
            bg = !bg
        }
        if (this.props.card.grade != null &&
            this.props.card.grade !== '') {
            items.push(
                <tr className={`${bg ? 'bg-slate-200' : ''}`}>
                    <td>Grade</td>
                    <td id="td-paid">{this.props.card.grade}</td>
                </tr>
            )
            bg = !bg
        }
        return items
    }

    render() {
        return (
            <div className='flex' id='card-dialog-root'>
                <div className='p-4 pr-2'>
                    <img className='rounded-xl w-96'
                        style={{ visibility: this.state.imgLoaded ? 'visible' : 'hidden' }}
                        src={baseURL + "/cardImg/" + encodeURIComponent(this.props.card?.cardId)}
                        alt=""
                        onLoad={() => this.setState({ ...this.state, imgLoaded: true })}
                        onError={(ev) => { if (ev.target instanceof HTMLImageElement) ev.target.src = './assests/pokemon-back.png' }}
                    />
                    <div className=''> </div>
                </div>
                <div className='w-[42rem] p-4 pl-2'>
                    <div className="flex w-full justify-center items-center">
                        <div className="text-2xl" >Prices</div>
                        <div className="flex-grow"></div>
                        <div>Market Price: ${this.props.card.price != null ? this.props.card.price.toFixed(2).toString() : "$-.--"}</div>
                    </div>
                    <div className='h-80'>
                        <VictoryChart
                            domainPadding={{ y: 3 }}
                            containerComponent={
                                <VictoryZoomContainer/>
                              }
                            width={700}
                            theme={VictoryTheme.material}>
                            {this.getLines()}
                        </VictoryChart>
                    </div>
                    <div className="text-2xl">Details</div>
                    <table className='w-full border-2'>
                        <tr className="bg-slate-200">
                            <td>Expansion</td>
                            <td id="td-expantion">{this.props.card.expName} - {this.props.card.expCardNumber}</td>
                        </tr>
                        <tr>
                            <td>Rarity</td>
                            <td id="td-rarity">{this.props.card.rarity}</td>
                        </tr>
                        <tr className="bg-slate-200">
                            <td>Card Type</td>
                            <td id="td-card-type">{this.props.card.cardType}</td>
                        </tr>
                        {this.getTableRows()}
                    </table>
                </div>
            </div>
        )
    }
}