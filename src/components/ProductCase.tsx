import React from 'react';

import { SealedProduct } from '../model/SealedProduct';
import {
    Paper,
    CircularProgress,
    Fab,
    Dialog,
    DialogTitle,
    IconButton
} from '@mui/material';
import DeleteForever from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { baseURL } from '..';
import { openLink, deleteSealedFromCollection } from '../controls/CardDB'
import { AddProductCollection } from './AddProductCollection';

class State {
    public imgLoaded = false
    public addDialogShow = false
}

class Props {
    id: string
    product: SealedProduct
    onDelete: () => void
}

export class ProductCase extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props)
        this.state = new State()
    }

    public getProdImg() {
        return (
            <div className="flex w-48 h-48 justify-center align-middle m-4">
                <img className={`cursor-pointer object-contain`}
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
            <div className='w-min-32 w-full'>
                <div className='h-4'></div>
                <div className='text-xl'>{this.props.product.name}</div>
                <div className='text-slate-500'>{this.props.product.type}</div>
            </div>
        )
    }

    private marketPrice() {
        if(this.props.product.paid != null){
            let color = ""
            let arrow = ""
            if(this.props.product.paid < this.props.product.price){
                color = 'text-green-600'
                arrow = '⬆︎'
            }else{
                color = 'text-red-500'
                arrow = '⬇︎'
            }
            let percent = (((this.props.product.price / this.props.product.paid) - 1) * 100).toFixed(0)
            return (<div className={color}>Market: ${this.props.product.price?.toFixed(2)} {`${arrow} ${percent}`}%</div>)
        }else{
            return (<div className='text-stone-700'>Market: ${this.props.product.price?.toFixed(2)}</div>)
        }
    }

    private paid() {
        if(this.props.product.paid != null){
            return (<div>Paid: ${this.props.product.paid.toFixed(2)}</div>)
        }
    }

    private buttons() {
        if (this.props.product.collection != null && this.props.product.collection !== "") {
            return (
                <div className='flex p-4'>
                    <div className='flex-grow'></div>
                    <Fab color="error" onClick={() => { this.onDelete() }}>
                        <DeleteForever></DeleteForever>
                    </Fab>
                </div>
            )
        } else {
            return (
                <div className='flex p-4'>
                    <div className='flex-grow'></div>
                    <Fab onClick={() => { this.onClickShop() }}>
                        <ShoppingCartIcon></ShoppingCartIcon>
                    </Fab>
                    <div className='w-4'></div>
                    <Fab onClick={() => { this.setState({ ...this.state, addDialogShow: true }) }}>
                        <AddIcon></AddIcon>
                    </Fab>
                </div>
            )
        }

    }

    private onDelete(){
        deleteSealedFromCollection(this.props.product).then(
            () => {
                this.props.onDelete()
            }
        ).catch(
            () => {
                console.log("FAILED TO DELETE")
            }
        )
    }

    private onClickShop() {
        openLink('tcgp', this.props.product)
    }

    private addDialog() {
        return (
            <Dialog open={this.state.addDialogShow} onClose={() => this.setState({ ...this.state, addDialogShow: false })} fullWidth={true}>
                <div className='flex justify-center items-center p-2 pr-4'>
                    <DialogTitle>Add {this.props.product.name}</DialogTitle>
                    <div className="flex-grow"></div>
                    <IconButton
                        id="close-card-add"
                        className="w-8 h-8"
                        size="large"
                        onClick={() => this.setState({ ...this.state, addDialogShow: false })}>
                        <ClearIcon />
                    </IconButton>
                </div>
                <AddProductCollection product={this.props.product} close={() => this.setState({ ...this.state, addDialogShow: false })}></AddProductCollection>
            </Dialog>
        )
    }

    render(): React.ReactNode {
        return (
            <div>
                <Paper elevation={2}>
                    <div className='flex h-full w-full justify-center items-center'>
                        <div className='h-full flex justify-center items-center'>
                            <div className="relative">
                                {this.imgSpinner()}
                                {this.getProdImg()}
                            </div>
                        </div>
                        <div className='flex flex-col h-auto w-auto'>
                            {this.productInfo()}
                            {this.marketPrice()}
                            {this.paid()}
                            <div className='flex-grow'></div>
                            {this.buttons()}
                        </div>
                    </div>
                </Paper>
                {this.addDialog()}
            </div>
        )
    }
} 