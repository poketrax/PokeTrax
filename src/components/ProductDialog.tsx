import React from 'react';
import { baseURL } from '../index'
import { SealedProduct, SealedPrice } from '../model/SealedProduct'
import { getProductPrices } from "../controls/CardDB"
import { CardBuyLink } from './CardBuyLink';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import  PricesDownload  from './PricesDownload'
import {
    VictoryChart,
    VictoryLine,
    VictoryScatter,
    VictoryTheme,
    VictoryTooltip,
    VictoryZoomContainer
} from 'victory'


interface Props {
    product: SealedProduct
    price?: string | JSX.Element
}
class State {
    public inProg = false
    public imgLoaded = false
    public prices = new Array<SealedPrice>()
    public start: Date

    constructor() {
        let _start = new Date(Date.now())
        _start.setMonth(_start.getMonth() - 1)
        this.start = _start
    }
}

export class ProductDialog extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = new State()
        getProductPrices(props.product, this.state.start, new Date(Date.now()))
            .then(
                (value) => {
                    this.setState({ ...this.state, prices: value })
                }
            )
    }

    private getLine(color: string): JSX.Element[] {
        let items = new Array<JSX.Element>()
        let _prices = this.state.prices
        if (_prices.length !== 0) {
            let data = _prices.map((value) => { return { x: new Date(value.date), y: value.price, label: `${value.vendor}: $${value.price.toFixed(2)}` } })
            items.push(
                <VictoryLine
                    style={{
                        data: { stroke: color },
                        parent: { border: "1px solid #ccc" }
                    }}
                    interpolation="natural"
                    data={data}
                    labelComponent={<VictoryTooltip />}
                />
            )
            items.push(
                <VictoryScatter data={data} labelComponent={<VictoryTooltip />} />
            )
        }
        return items
    }

    private getLines() {
        let colors = ["#ff0000", "#0000ff", "#00ff00"]
        let items = []
        items.push(this.getLine(colors[0]))
        return items
    }

    private buttons() {
        return (
            <div className='flex w-full items-center'>
                <div className='flex justify-center items-center mb-2'>
                    <ShoppingCartIcon></ShoppingCartIcon>
                </div>
                <div className='w-4'></div>
                <CardBuyLink type="tcgp" item={this.props.product}></CardBuyLink>
                <div className='w-2'></div>
                <CardBuyLink type="ebay" item={this.props.product}></CardBuyLink>
                <div className='w-2'></div>
                <CardBuyLink type="amazon" item={this.props.product}></CardBuyLink>
                <div className='flex-grow'></div>
                <PricesDownload
                    item={this.props.product}
                    type={'product'}
                    start={this.state.start}
                    end={new Date(Date.now())}
                />
                <div className='h-4'></div>
            </div>
        )
    }

    render() {
        return (
            <div className='flex' id='card-dialog-root'>
                <div className='p-4 pr-2'>
                    <img className='rounded-xl w-96 h-96 object-contain'
                        style={{ visibility: this.state.imgLoaded ? 'visible' : 'hidden' }}
                        src={baseURL + "/sealedImg/" + encodeURIComponent(this.props.product?.name)}
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
                        <div>Market Price: ${this.props.product.price != null ? this.props.product.price.toFixed(2).toString() : "$-.--"}</div>
                    </div>
                    <div className='h-80'>
                        <VictoryChart
                            domainPadding={{ y: [32, 32], x: 32 }}
                            containerComponent={
                                <VictoryZoomContainer />
                            }
                            width={700}
                            theme={VictoryTheme.material}>
                            {this.getLines()}
                        </VictoryChart>
                    </div>
                    {this.buttons()}
                </div>
            </div>
        )
    }

}