import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper'
import CloseIcon from '@mui/icons-material/Close';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { Collection } from '../model/Collection';
import TextField from '@mui/material/TextField';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {
    getCollections,
    addCollection,
    deleteCollection,
    getCollectionCards
} from '../controls/CardDB'
import LinearProgress from '@mui/material/LinearProgress';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { CardCase } from './CardCase';
import { Card } from '../model/Card'

class State {
    public collection = ""
    public CollectionCards = Array<Card>()
    public cardTotal = 0
    public collections = new Array<Collection>()
    public addDialogOpen = false
    public deleteDialogOpen = false
    public searchValue = ""
    public page = 0
}

interface DialogProps {
    open: boolean;
    name: string
    onClose: () => void;
}

function AddDialog(props: DialogProps) {
    const { onClose, open } = props;
    const [name, setName] = React.useState('');
    const [inProg, setInProg] = React.useState(false)

    const handleClose = () => {
        onClose();
    };

    const addColl = () => {
        setInProg(true)
        addCollection(name).then(
            (_) => {
                setInProg(false)
                onClose()
            }
        )
    }
    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Add Collection</DialogTitle>
            <div className='w-96 m-4'>
                <TextField className="w-full" id="outlined-basic" label="Name" variant="outlined" value={name} onChange={(ev) => { setName(ev.target.value) }} />
                <div className="w-full pt-2 pb-2 flex items-center justify-center">
                    <Button className="w-full" variant='contained' onClick={addColl} startIcon={<AddCircleOutlineIcon />}>Add</Button>
                    <div className='w-2'></div>
                    <Button className="w-full" variant='contained' onClick={handleClose} startIcon={<CloseIcon />}>Cancel</Button>
                </div>
                {inProg && <LinearProgress />}
            </div>
        </Dialog>
    );
}

function DeleteDialog(props: DialogProps) {
    const { onClose, name, open } = props;
    const [inProg, setInProg] = React.useState(false)

    const handleClose = () => {
        onClose();
    };

    const delColl = () => {
        setInProg(true)
        deleteCollection(name).then(
            (_) => {
                setInProg(false)
                handleClose()
            }
        )
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Delete Collection?</DialogTitle>
            <div className='w-96 m-4'>
                <div>Are you shure you want to delete {name}? This cannot be undone</div>
                <div className="w-full pt-2 pb-2 flex items-center justify-center">
                    <Button className="w-full" variant='contained' onClick={delColl} startIcon={<DeleteForeverIcon />} color="error">Delete</Button>
                    <div className='w-2'></div>
                    <Button className="w-full" variant='contained' onClick={handleClose} startIcon={<CloseIcon />}>Cancel</Button>
                </div>
                {inProg && <LinearProgress />}
            </div>
        </Dialog>
    );
}
export class Collections extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props)
        this.state = new State()
        this.getCollects()
    }

    public searchTerm = ""

    private getCollects() {
        getCollections().then(
            (value) => {
                let selected = ""
                if (value.length != 0 && this.state.collection === "") {
                    selected = value[0].name
                } else {
                    selected = this.state.collection
                }
                this.setState({ ...this.state, collections: value })
                this.setCollection(selected)
            }
        )
    }

    private setCollectionEvent = (event: React.SyntheticEvent, newValue: string) => {
        this.setCollection(newValue)
    }

    private setCollection(collection: string) {
        getCollectionCards(collection, this.state.searchValue, this.state.page)
            .then(
                (search) => {
                    this.setState({ ...this.state, cardTotal: search.total, CollectionCards: search.cards })
                }
            )
        this.setState({ ...this.state, collection: collection })
    }

    private generateTabs(): JSX.Element[] {
        let tabs = []
        for (let coll of this.state.collections) {
            tabs.push((<Tab label={coll.name} value={coll.name} />))
        }
        return tabs;
    }

    private closeDialog() {
        this.setState({ ...this.state, addDialogOpen: false, deleteDialogOpen: false })
        this.getCollects()
    }

    renderCards() {
        let items = []
        for (let card of this.state.CollectionCards) {
            items.push(
                <CardCase
                    card={card}
                    onDelete={() => {
                        this.setCollection(this.state.collection)
                     }}>
                </CardCase>)
        }
        return items
    }

    render() {
        return (
            <div>
                <div className="flex h-16 w-full justify-center items-center pr-4 bg-gray-200">
                    <Tabs className="flex-grow" value={this.state.collection} onChange={this.setCollectionEvent} variant="scrollable" scrollButtons="auto">
                        {this.generateTabs()}
                    </Tabs>
                    <Button variant='contained' startIcon={<AddCircleOutlineIcon />} onClick={() => { this.setState({ ...this.state, addDialogOpen: true }) }}>
                        New Collection
                    </Button>
                </div>
                {this.state.collection !== "" &&
                    (
                        <div>
                            <div className='w-full'>
                                <div className='flex items-center justify-center h-16 p-4 w-full'>
                                    <TextField className='min-w-fit w-80'
                                        id="outlined-basic"
                                        label="Search"
                                        variant="outlined"
                                        onChange={(e) => this.searchTerm = e.target.value}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                            }
                                        }} />
                                    <div className='flex-grow'></div>
                                    <Button variant='contained' startIcon={<DeleteForeverIcon />} color="error" onClick={() => { this.setState({ ...this.state, deleteDialogOpen: true }) }} >Delete</Button>
                                </div>
                            </div>
                            <div className='w-full'>
                                {this.renderCards()}
                            </div>
                        </div>
                    )
                }
                <AddDialog
                    open={this.state.addDialogOpen}
                    name=""
                    onClose={() => this.closeDialog()}
                />
                <DeleteDialog
                    open={this.state.deleteDialogOpen}
                    name={this.state.collection}
                    onClose={() => this.closeDialog()}
                />
            </div>
        )
    }
}