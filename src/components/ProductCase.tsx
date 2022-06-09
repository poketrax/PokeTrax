import React from 'react';

import { SealedProduct } from '../model/SealedProduct';
import { Paper, CircularProgress, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
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
            <div className="flex w-48 h-48 justify-center align-middle m-4">
                <img className={`cursor-pointer w-auto h-auto`}
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
            <div className='w-min-32 w-full p-2'>
                <div className='h-4'></div>
                <div className='text-xl'>{this.props.product.name}</div>
                <div className='text-slate-500'>{this.props.product.type}</div>
                <div className='text-stone-700'>Market: ${this.props.product.price?.toFixed(2)}</div>
            </div>
        )
    }

    private buttons() {
        return (
            <div className='flex p-4'>
                <div className='flex-grow'></div>
                <Fab>
                    <ShoppingCartIcon></ShoppingCartIcon>
                </Fab>
                <div className='w-4'></div>
                <Fab>
                    <AddIcon></AddIcon>
                </Fab>
            </div>
        )
    }

    render(): React.ReactNode {
        return (
            <div>
                <Paper elevation={2}>
                    <div className='flex h-auto'>
                        <div className="relative">
                            {this.imgSpinner()}
                            {this.getProdImg()}
                        </div>
                        <div className='flex-grow'></div>
                        <div className='flex flex-col h-auto w-auto'>
                            {this.productInfo()}
                            <div className='flex-grow'></div>
                            {this.buttons()}
                        </div>
                    </div>
                </Paper>
            </div>
        )
    }
} 