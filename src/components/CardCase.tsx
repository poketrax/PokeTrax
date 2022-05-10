import React from 'react';
import { Card, Price } from '../model/Card'
import { baseURL } from '../index'
import {
    getRarity,
    getTCGPprice,
    deleteCardFromCollection,
    getEnergy
} from '../controls/CardDB';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import { AddCardCollection } from './AddCardCollection';
import {
    Dialog,
    DialogTitle,
    IconButton,
    CircularProgress,
    Button,
    Paper,
    Tooltip,
    Fab,
    ButtonGroup
} from '@mui/material';
import { CardDialog } from './CardDialog';

interface Props {
    card: Card
    onDelete: () => void
}

class State {
    public prices = new Array<Price>()
    public imgLoaded = false
    public addDialogShow = false
    public cardDialogShow = false
}

export class CardCase extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = new State()
        getTCGPprice(props.card).then(
            (value) => {
                this.setState({ ...this.state, prices: value })
            }
        )
    }
    render() {
        return (
            <div className='flex justify-center'>
                <Paper
                    elevation={3}
                    className='rounded-lg w-72 h-fit hover:shadow-2xl hover:bg-blue-500 hover:text-white'
                    onClick={() => this.setState({...this.state, cardDialogShow: true})}>
                    <div className='h-16 mt-4 mb-2 ml-4 mr-4 p-2 border-2 rounded-md flex items-center '>
                        {getEnergy(this.props.card?.energyType ?? "")}
                        <span className='pl-2 text-lg truncate' >{this.props.card?.name}</span>
                        <div className='flex-grow'></div>
                        {
                            this.getCornerButton()
                        }
                    </div>
                    <div className="flex w-full items-center justify-center ">

                        {
                            this.getCollectionButtons()
                        }
                    </div>
                    <div style={{ position: 'relative' }}>
                        {this.imgSpinner()}
                        <div className="flex justify-center align-middle">
                            <img className='w-64 h-[357px] rounded-xl'
                                style={{ visibility: this.state.imgLoaded ? 'visible' : 'hidden' }}
                                src={baseURL + "/cardImg/" + this.props.card?.cardId}
                                alt=""
                                onLoad={() => this.setState({ ...this.state, imgLoaded: true })}
                                onError={(ev) => { if (ev.target instanceof HTMLImageElement) ev.target.src = './assests/pokemon-back.png' }}
                            />
                        </div>
                    </div>
                    <div className='h-8 pl-2 pr-2 flex justify-center items-center'>
                        <div className='flex justify-items-center items-center h-8 w-8 ml-2'>
                            <Tooltip title={this.props.card.expName}>
                                <img className='h-6' alt="" src={baseURL + "/expSymbol/" + this.props.card?.expName} />
                            </Tooltip>
                        </div>
                        <div className='grow'></div>
                        <a href={'https://tcgplayer.com/product/' + this.props.card?.idTCGP}>{this.getPrice()}</a>
                        <div className='grow'></div>
                        <div>{this.props.card?.expCardNumber}</div>
                        <div className='grow'></div>
                        <Tooltip title={this.props.card.rarity}>
                            <div className='flex justify-items-center items-center h-8 w-8'>
                                {getRarity(this.props.card?.rarity ?? "")}
                            </div>
                        </Tooltip>
                    </div>
                </Paper>
                <Dialog open={this.state.addDialogShow} onClose={() => this.setState({ ...this.state, addDialogShow: false })}>
                    <div className='flex justify-center items-center w-96 p-2 pr-4'>
                        <DialogTitle>Add {this.props.card.name}</DialogTitle>
                        <div className="flex-grow"></div>
                        <IconButton className="w-8 h-8" size="large" onClick={() => this.setState({ ...this.state, addDialogShow: false })}>
                            <ClearIcon />
                        </IconButton>
                    </div>
                    <AddCardCollection card={this.props.card} close={() => this.setState({ ...this.state, addDialogShow: false })}></AddCardCollection>
                </Dialog>
                <Dialog 
                    maxWidth='xl'
                    open={this.state.cardDialogShow} 
                    onClose={() => this.setState({ ...this.state, cardDialogShow: false })}>
                    <div className='flex justify-center items-center w-full p-2 pr-4'>
                        <DialogTitle className='flex items-center'>
                            {getEnergy(this.props.card?.energyType ?? "")}
                            <div className='w-2'></div>
                             {this.props.card.name}
                            </DialogTitle>
                        <div className="flex-grow"></div>
                        <IconButton className="w-8 h-8" size="large" onClick={() => this.setState({ ...this.state, cardDialogShow: false })}>
                            <ClearIcon />
                        </IconButton>
                    </div>
                    <CardDialog card={this.props.card}></CardDialog>
                </Dialog>
            </div>
        )
    }

    getCollectionButtons() {
        if (this.props.card.collection != null) {
            return (
                <ButtonGroup className="w-full mb-2 ml-4 mr-4 bg-white" variant="outlined">
                    <Button className="w-full" startIcon={<DeleteIcon />} onClick={(ev) => { this.deleteCard() }}>Delete</Button>
                    <Button className="w-full" startIcon={<EditIcon />}>Edit</Button>
                </ButtonGroup>
            )
        }
    }

    deleteCard() {
        deleteCardFromCollection(this.props.card)
        this.props.onDelete()
    }

    getCornerButton() {
        if (this.props.card.collection == null) {
            return (
                <Fab aria-label="add" size="small" onClick={() => this.setState({ ...this.state, addDialogShow: true })}>
                    <AddIcon />
                </Fab>)
        }
    }

    imgSpinner() {
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

    componentWillReceiveProps(props: Props) {
        if (props.card.cardId !== this.props.card.cardId) {
            this.setState(new State())
            getTCGPprice(props.card).then(
                (data) => {
                    this.setState({ ...this.state, prices: data })
                }
            )
        }
    }

    private getPrice(): string | JSX.Element {
        if (this.state.prices?.length !== 0) {
            let val = "-.--"
            for (let price of this.state.prices) {
                if (price.price != null) {
                    val = `$${price.price.toFixed(2).toString()}`
                }
            }
            return val
        } else {
            return (<CircularProgress size="1rem" />)
        }
    }

    
}