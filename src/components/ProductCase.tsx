import React from 'react';

import { SealedProduct } from '../model/SealedProduct';
import { Paper, CircularProgress } from '@mui/material';
import { baseURL } from '..';

class State {
    public imgLoaded = false
}

class Props {
    id: string
    product: SealedProduct

}

export class ProductCase extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props)
        this.state = new State()
    }

    public getProdImg() {
        return (
            <div className="flex w-max-20 h-max-20 justify-center align-middle m-4">
                <img className={`rounded-xl cursor-pointer w-max-20 h-max-20`}
                    id={`card-img${this.props.id}`}
                    style={{ visibility: this.state.imgLoaded ? 'visible' : 'hidden' }}
                    src={baseURL + "/sealedImg/" + encodeURIComponent(this.props.product.name)}
                    alt={this.props.product.name}
                    onClick={() => { }}
                    onLoad={() => this.setState({ ...this.state, imgLoaded: true })}
                    onError={(ev) => { if (ev.target instanceof HTMLImageElement) ev.target.src = './assests/pokemon-back.png' }}
                />
            </div>
        )
    }

    private imgSpinner() {
        if (this.state.imgLoaded === false) {
            return (
                <div className="h-full" style={{ position: 'absolute' }}>
                    <div className='flex items-center justify-center w-64 h-full'>
                        <CircularProgress className="flex" size={100} ></CircularProgress>
                    </div>
                </div>
            )
        }
    }

    private productInfo() {
        return (
            <div className='w-64'>
                <div className='h-4'></div>
                <div className='text-lg'>{this.props.product.name}</div>
                <table>
                    <tr>
                        <td>Market Price:</td>
                        <td>${this.props.product.price?.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Type:</td>
                        <td>{this.props.product.type}</td>
                    </tr>
                </table>
            </div>
        )
    }

    render(): React.ReactNode {
        return (
            <div>
                <Paper elevation={2}>
                    <div className='flex'>
                        <div className="relative">
                            {this.imgSpinner()}
                            {this.getProdImg()}
                        </div>
                        {this.productInfo()}
                    </div>
                </Paper>
            </div>
        )
    }
} 