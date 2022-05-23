import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { Collection } from '../model/Collection';
import TextField from '@mui/material/TextField';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TablePagination from '@mui/material/TablePagination'
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
    public collectionCards = Array<Card>()
    public total = 0
    public collections = new Array<Collection>()
    public addDialogOpen = false
    public deleteDialogOpen = false
    public searchValue = ""
    public sort = ""
    public page = 0
}

interface DialogProps {
    open: boolean;
    name: string
    collections?: Array<Collection>
    onClose: () => void;
    onConfirm: (name: string) => void;
}

function AddDialog(props: DialogProps) {
    const { onClose, onConfirm, open, collections } = props;
    const [name, setName] = React.useState('');
    const [inProg, setInProg] = React.useState(false)
    const [addCollError, setAddCollError] = React.useState(false)
    const [addCollErrorText, setAddCollErrorText] = React.useState("")

    const handleClose = () => {
        setName("")
        onClose();
    };

    const addColl = () => {
        setInProg(true)
        if (collections?.find((coll) => coll.name === name)) {
            setAddCollError(true)
            setAddCollErrorText(`Collection ${name} Already Exists`)
            setInProg(false)
        } else {
            addCollection(name).then(
                (_) => {
                    setInProg(false)
                    setName("")
                    onConfirm(name)
                    onClose()
                }
            )
        }
    }

    return (
        <Dialog
            id="add-collection-dialog"
            onClose={handleClose}
            open={open}>
            <DialogTitle>Add Collection</DialogTitle>
            <div className='w-96 m-4'>
                <TextField
                    className="w-full"
                    id="add-collection-name"
                    label="Name"
                    variant="outlined"
                    error={addCollError}
                    value={name}
                    onChange={(ev) => { setName(ev.target.value) }} />
                {addCollError && (<div id="add-collection-error">{addCollErrorText}</div>)}
                <div className="w-full pt-2 pb-2 flex items-center justify-center">
                    <Button
                        id="add-collection-confirm-button"
                        className="w-full"
                        variant='contained'
                        onClick={addColl} startIcon={<AddCircleOutlineIcon />}>Add</Button>
                    <div className='w-2'></div>
                    <Button
                        id="add-collection-cancel-button"
                        className="w-full"
                        variant='contained'
                        onClick={handleClose}
                        startIcon={<CloseIcon />}>Cancel</Button>
                </div>
                {inProg && <LinearProgress />}
            </div>
        </Dialog>
    );
}

function DeleteDialog(props: DialogProps) {
    const { onClose, onConfirm, name, open } = props;
    const [inProg, setInProg] = React.useState(false)

    const handleClose = () => {
        onClose();
    };

    const delColl = () => {
        setInProg(true)
        deleteCollection(name).then(
            (_) => {
                setInProg(false)
                onConfirm(name)
                handleClose()
            }
        )
    }

    return (
        <Dialog
            id="delete-confirm-dialog"
            onClose={handleClose}
            open={open}>
            <DialogTitle>Delete Collection?</DialogTitle>
            <div className='w-96 m-4'>
                <div>Are you shure you want to delete {name}? This cannot be undone</div>
                <div className="w-full pt-2 pb-2 flex items-center justify-center">
                    <Button
                        id="delete-confirm-button"
                        className="w-full"
                        variant='contained'
                        onClick={delColl}
                        startIcon={<DeleteForeverIcon />} color="error">Delete</Button>
                    <div className='w-2'></div>
                    <Button
                        id="delete-confim-cancel-button"
                        className="w-full"
                        variant='contained'
                        onClick={handleClose}
                        startIcon={<CloseIcon />}>Cancel</Button>
                </div>
                {inProg && <LinearProgress id="delete-in-prog" />}
            </div>
        </Dialog>
    );
}
export class Collections extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props)
        this.state = new State()
        getCollections().then(
            (value) => {
                let selected = ""
                if (value.length !== 0 && this.state.collection === "") {
                    selected = value[0].name
                } else {
                    selected = this.state.collection
                }
                this.setState({ ...this.state, collections: value })
                this.setCollection(selected, this.state.page)
            }
        )
    }

    public searchTerm = ""

    private _getCollections() {
        getCollections().then(
            (value) => {
                this.setState({ ...this.state, collections: value })
            }
        )
    }

    private setCollectionEvent = (event: React.SyntheticEvent, coll: string) => {
        this.setCollection(coll, 0)
    }

    private setCollection(_collection: string, page: number, _delete?: boolean, searchValue?: string, sort?: string) {
        let collection = _collection
        if (_delete) {
            if (this.state.collections.length !== 0) {
                collection = this.state.collections[0].name
            }
            this.setState({
                ...this.state,
                collection: collection,
                collections: this.state.collections.filter((value) => value.name !== _collection)
            })
        }
        
        getCollectionCards(collection, page, searchValue ?? this.state.searchValue, sort ?? this.state.sort)
            .then(
                (search) => {
                    this.setState(
                        {
                            ...this.state,
                            total: search.total,
                            collectionCards: search.cards,
                            collection: collection,
                            searchValue: searchValue ?? this.state.searchValue,
                            sort: sort ?? this.state.sort,
                            page: page
                        }
                    )
                }
            )
    }

    private generateTabs(): JSX.Element[] {
        let tabs = []
        for (let coll of this.state.collections) {
            tabs.push((<Tab id={`tab-${coll.name.replace(" ", "-")}`} label={coll.name} value={coll.name} />))
        }
        return tabs;
    }

    private closeDialog() {
        this.setState({ ...this.state, addDialogOpen: false, deleteDialogOpen: false })
        this._getCollections()
    }

    private handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        this.setCollection(this.state.collection, newPage)
    };

    renderCards() {
        let items = []
        for (let i = 0; i < this.state.collectionCards.length; i++) {
            let card = this.state.collectionCards[i]
            items.push(
                <CardCase
                    id={`card-case-${i}`}
                    card={card}
                    onDelete={() => {
                        this.setCollection(this.state.collection, this.state.page)
                    }}>
                </CardCase>)
        }
        return items
    }

    render() {
        return (
            <div>
                <div className="flex h-16 w-full justify-center items-center pr-4 bg-gray-200">
                    <Tabs
                        id="collection-tabs"
                        className="flex-grow"
                        value={this.state.collection}
                        onChange={this.setCollectionEvent} variant="scrollable" scrollButtons="auto">
                        {this.generateTabs()}
                    </Tabs>
                    <Button
                        id="add-collection-button"
                        variant='contained'
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => { this.setState({ ...this.state, addDialogOpen: true }) }}>
                        New Collection
                    </Button>
                </div>
                {this.state.collections.length !== 0 &&
                    (
                        <div>
                            <div id="collection-search-bar" className='w-full'>
                                <div className='flex items-center justify-center h-16 p-4 w-full'>
                                    <TextField className='min-w-fit w-80'
                                        id="collection-text-search"
                                        label="Search"
                                        variant="outlined"
                                        onChange={(e) => this.searchTerm = e.target.value}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                                this.setCollection(this.state.collection, 0, false, this.searchTerm)
                                            }
                                        }} />
                                    <div className='flex-grow'></div>
                                    <ToggleButtonGroup
                                        className='h-10'
                                        value={this.state.sort}
                                        exclusive
                                        onChange={(_, value) => {
                                            console.log(value)
                                            this.setCollection(this.state.collection, 0, false, this.state.searchValue, value)
                                        }}>
                                        <ToggleButton value="wish" id="sort-wish">
                                            <div>Wishlist</div>
                                        </ToggleButton>
                                        <ToggleButton value="name" id="sort-name">
                                            <div>Name</div>
                                        </ToggleButton>
                                        <ToggleButton value="setNumber" id="sort-set-number">
                                            <div>Set #</div>
                                        </ToggleButton>
                                        <ToggleButton value="pokedex" id="sort-dex-number">
                                            <div>Dex #</div>
                                        </ToggleButton>
                                        <ToggleButton value="priceASC" id="sort-price">
                                            <div>$ ⬆︎</div>
                                        </ToggleButton>
                                        <ToggleButton value="priceDSC" id="sort-price">
                                            <div>$ ⬇︎</div>
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                    <div className='w-4'></div>
                                    <Button
                                        id="delete-collection-button"
                                        variant='contained'
                                        startIcon={<DeleteForeverIcon />}
                                        color="error"
                                        onClick={() => { this.setState({ ...this.state, deleteDialogOpen: true }) }}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                            <div className='h-[calc(100vh-14rem)] overflow-auto'>
                            {
                                (this.state.collectionCards.length !== 0)
                                &&
                                (<div id="collection-cards" className='w-full'>
                                    <TablePagination
                                        id="card-collection-pagination"
                                        component="div"
                                        count={this.state.total}
                                        page={this.state.page}
                                        rowsPerPage={25}
                                        rowsPerPageOptions={[25]}
                                        onPageChange={this.handleChangePage}
                                    />
                                    <div className='flex'>
                                        <div className='flex-grow'></div>
                                        <div className='grid h-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4'
                                            id="card-grid">
                                            {this.renderCards()}
                                        </div>
                                        <div className='flex-grow'></div>
                                    </div>
                                    <TablePagination
                                        component="div"
                                        count={this.state.total}
                                        page={this.state.page}
                                        rowsPerPage={25}
                                        rowsPerPageOptions={[25]}
                                        onPageChange={this.handleChangePage}
                                    />
                                </div>)
                            }
                            </div>
                        </div>
                    )
                }
                <AddDialog
                    open={this.state.addDialogOpen}
                    name=""
                    collections={this.state.collections}
                    onClose={() => this.closeDialog()}
                    onConfirm={(name) => { this.setCollection(name, 0) }}
                />
                <DeleteDialog
                    open={this.state.deleteDialogOpen}
                    name={this.state.collection}
                    collections={this.state.collections}
                    onConfirm={() => {
                        this.setCollection(this.state.collection, 0, true)
                    }}
                    onClose={() => {
                        this.closeDialog()
                    }}
                />
            </div>
        )
    }
}