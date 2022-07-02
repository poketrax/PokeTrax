import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { Tooltip } from '@mui/material';
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
    getCollectionCards,
    getCollectionValue,
    rarities,
    getRarity,
    addCardToCollection,
    getCollectionSealed,
    renameCollection
} from '../controls/CardDB'
import LinearProgress from '@mui/material/LinearProgress';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { CardCase } from './CardCase';
import { Card } from '../model/Card'
import DownloadMenu from './DownloadMenu';
import { CgPokemon } from "react-icons/cg"
import { MdOutlineCatchingPokemon } from "react-icons/md"
import { FileUploader } from "react-drag-drop-files";
import { SealedProduct } from '../model/SealedProduct';
import { ProductCase } from './ProductCase';

const fileTypes = ["JSON"];

const icon = <CgPokemon />;
const checkedIcon = <MdOutlineCatchingPokemon />;
class State {
    public collection = ""
    public collectionCards = Array<Card>()
    public collectionProducts = Array<SealedProduct>()
    public total = 0
    public collections = new Array<Collection>()
    public addDialogOpen = false
    public deleteDialogOpen = false
    public renameDialogOpen = false
    public importDialogOpen = false
    public searchValue = ""
    public rareSelected: string[] = []
    public sort = ""
    public display = "cards"
    public page = 0
    public totalValue = 0
    public rarities = []
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
    const [prog, setProg] = React.useState(0)
    const [addCollError, setAddCollError] = React.useState(false)
    const [addCollErrorText, setAddCollErrorText] = React.useState("")
    const [file, setFile] = React.useState(null)

    const handleClose = () => {
        setName("")
        onClose();
    };

    function addColl() {
        setInProg(true)
        if (collections?.find((coll) => coll.name === name)) {
            setAddCollError(true)
            setAddCollErrorText(`Collection ${name} Already Exists`)
            setInProg(false)
        } else {
            addCollection(name).then(
                (_) => {
                    setInProg(false)
                    // setName("")
                    onConfirm(name)
                    onClose()
                }
            )
        }
    }

    function uploadColl() {
        setInProg(true)
        if (collections?.find((coll) => coll.name === name)) {
            setAddCollError(true)
            setAddCollErrorText(`Collection ${name} Already Exists`)
            setInProg(false)
        } else {
            if (file != null) {
                var reader = new FileReader()
                console.log(file)
                reader.readAsText(file)
                reader.onload = async () => {
                    if (typeof (reader.result) === 'string') {
                        let cards: Array<Card> = JSON.parse(reader.result)
                        addCollection(name)
                        for (let i = 0; i < cards.length; i++) {
                            let card = cards[i]
                            setProg((i / cards.length) * 100)
                            console.log(card)
                            card.collection = name
                            await addCardToCollection(card)
                        }
                        setInProg(false)
                        setName("")
                        onConfirm(name)
                        onClose()
                    }
                }
            }
        }
    }

    const addUploadClick = () => {
        if (name != null && name !== "") {
            if (file != null) {
                uploadColl()
            } else {
                addColl()
            }
        } else {
            setAddCollErrorText("Collection Name Cannot be Empty")
            setAddCollError(true)
        }
    }

    return (
        <Dialog
            id="add-collection-dialog"
            onClose={handleClose}
            open={open}>
            <DialogTitle>Add/Upload Collection</DialogTitle>
            <div className='w-96 m-4'>
                <TextField
                    className="w-full"
                    id="add-collection-name"
                    label="Name"
                    variant="outlined"
                    error={addCollError}
                    value={name}
                    onChange={(ev) => { setName(ev.target.value) }} />
                <div className='pt-2'>{file != null ? `File: ${file.name}` : `Collection file upload *optional`}</div>
                <FileUploader
                    label="Upload or Drop JSON file here"
                    handleChange={(file) => { setFile(file); console.log(file) }}
                    name="file"
                    types={fileTypes} />
                {addCollError && (<div className='text-red-600' id="add-collection-error">{addCollErrorText}</div>)}
                <div className="w-full pt-4 pb-2 flex items-center justify-center">
                    <Button
                        id="add-collection-confirm-button"
                        className="w-full"
                        variant='contained'
                        onClick={addUploadClick}
                        startIcon={<AddCircleOutlineIcon />}>Add</Button>
                    <div className='w-2'></div>
                    <Button
                        id="add-collection-cancel-button"
                        className="w-full"
                        variant='contained'
                        onClick={handleClose}
                        startIcon={<CloseIcon />}>Cancel</Button>
                </div>
                {inProg && <LinearProgress variant='determinate' value={prog} />}
            </div>
        </Dialog>
    );
}

function RenameDialog(props: DialogProps) {
    const { onClose, onConfirm, open, collections } = props;
    const [name, setName] = React.useState('');
    const [prog, setProg] = React.useState(0)
    const [inProg, setInProg] = React.useState(false)
    const [renameError, setRenameError] = React.useState(false)
    const [renameErrorText, setRenameErrorText] = React.useState("")

    const handleClose = () => {
        setName("")
        onClose();
    };

    const progressCallback = (progress: number, finished: boolean): void => {
        console.log(`prog: ${progress} finish: ${finished}`)
        setProg(progress)
        if (finished) {
            handleClose();
            onConfirm(name)
        }
    }

    const rename = () => {
        if (name != null && name !== '') {
            renameCollection(props.name, name, progressCallback)
            setInProg(true)
            setRenameErrorText("In Progress don't close dialog")
        } else {
            setRenameError(true)
            setRenameErrorText("Please set a new Collection name")
        }
    }

    return (
        <Dialog
            id="rename-collection-dialog"
            onClose={handleClose}
            open={open}>
            <DialogTitle>Rename Collection {props.name}</DialogTitle>
            <div className='w-96 m-4'>
                <TextField
                    className="w-full"
                    id="rename-collection-name"
                    label="Name"
                    variant="outlined"
                    error={renameError}
                    value={name}
                    onChange={(ev) => { setName(ev.target.value) }} />
                {renameError && (<div id="rename-collection-error">{renameErrorText}</div>)}
                <div className="w-full pt-2 pb-2 flex items-center justify-center">
                    <Button
                        id="rename-collection-confirm-button"
                        className="w-full"
                        variant='contained'
                        onClick={rename} startIcon={<EditIcon />}>Rename</Button>
                    <div className='w-2'></div>
                    <Button
                        id="add-collection-cancel-button"
                        className="w-full"
                        variant='contained'
                        onClick={handleClose}
                        startIcon={<CloseIcon />}>Cancel</Button>
                </div>
                {inProg && <LinearProgress variant='determinate' value={prog} />}
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
    }
    
    componentDidMount(): void {
        Promise.all([rarities(), getCollections()])
            .then(
                ([rarities, collections]) => {
                    this.setState({rarities, collections}, () => {
                        const selected = collections.length > 0 && this.state.collection === "" ?
                            collections[0].name : this.state.collection;
                        this.setCollection(selected, this.state.page)
                    })
                }
            );
    }

    public searchTerm = ""

    private _getCollections() {
        getCollections().then(
            (collections) => {
                console.log(this.state);
                this.setState({ collections })
            }
        )
    }

    private setCollectionEvent = (event: React.SyntheticEvent, coll: string) => {
        this.setCollection(coll, 0)
    }

    private setCollection(_collection: string, page: number, _delete?: boolean, searchValue?: string, rarityFilter?: string[], sort?: string, display?: string) {
        let collection = _collection
        if (_delete) {
            if (this.state.collections.length !== 0) {
                collection = this.state.collections[0].name
            }
            this.setState({
                ...this.state,
                collection,
                collections: this.state.collections.filter((value) => value.name !== _collection)
            })
        }
        if (_collection != null && _collection !== "") {
            getCollectionValue(_collection)
                .then(
                    (value) => {
                        this.setState({ totalValue: value.data.totalValue })
                    }
                )
            let _display = display ?? this.state.display
            if (_display === "cards") {
                getCollectionCards(collection, page, searchValue ?? this.state.searchValue, rarityFilter ?? this.state.rareSelected, sort ?? this.state.sort)
                    .then(
                        (search) => {
                            this.setState(
                                {
                                    total: search.total,
                                    collectionCards: search.cards,
                                    collection,
                                    searchValue: searchValue ?? this.state.searchValue,
                                    rareSelected: rarityFilter ?? this.state.rareSelected,
                                    sort: sort ?? this.state.sort,
                                    display: display ?? this.state.display,
                                    page
                                }
                            )
                        }
                    )
            } else {
                getCollectionSealed(collection, page, searchValue ?? this.state.searchValue, sort ?? this.state.sort)
                    .then(
                        (search) => {
                            this.setState(
                                {
                                    total: search.total,
                                    collectionProducts: search.products,
                                    collection,
                                    searchValue: searchValue ?? this.state.searchValue,
                                    rareSelected: rarityFilter ?? this.state.rareSelected,
                                    sort: sort ?? this.state.sort,
                                    display: display ?? this.state.display,
                                    page
                                }
                            )
                        }
                    )
            }
        }
    }

    private generateTabs(): JSX.Element[] {
        return this.state.collections.map((coll, i) => (
            <Tab
                key={i}
                id={`tab-${coll.name.replace(" ", "-")}`}
                label={coll.name}
                value={coll.name}
            />
        ));
    }

    private closeDialog() {
        this.setState({addDialogOpen: false, deleteDialogOpen: false, renameDialogOpen: false })
        this._getCollections()
    }

    private handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        this.setCollection(this.state.collection, newPage)
    };

    private renderCards() {
        return this.state.collectionCards.map((card, i) => (
            <CardCase
                key={`${i}`}
                id={`card-case-${i}`}
                card={card}
                onDelete={() => {
                    this.setCollection(this.state.collection, this.state.page);
                }}
            ></CardCase>
        ));
    }

    private renderProducts() {
        let items = []
        for (let i = 0; i < this.state.collectionProducts.length; i++) {
            let prod = this.state.collectionProducts[i]
            items.push(
                <ProductCase
                    id={`${i}`}
                    product={prod}
                    onDelete={() => { this.setCollection(this.state.collection, this.state.page) }}>
                </ProductCase>
            )
        }
        return items
    }

    private gridStyle(): string {
        if (this.state.display === "cards") {
            return 'grid h-full grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4'
        } else {
            return 'grid h-full grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4'
        }
    }

    private cardContainer() {
        if (this.state.collectionCards.length !== 0) {
            return (
                <div id="collection-cards" className='w-full'>
                    <div className='flex justify-center items-center'>
                        <div className='flex-grow'></div>
                        <div className='h-10 pr-2 pl-2 border-2 rounded-md flex justify-center items-center'>
                            <div>Total Value: ${this.state.totalValue != null ? this.state.totalValue.toFixed(2) : "-.--"}</div>
                        </div>
                        <div className='w-16'></div>
                        <TablePagination
                            id="card-collection-pagination"
                            component="div"
                            count={this.state.total}
                            page={this.state.page}
                            rowsPerPage={25}
                            rowsPerPageOptions={[25]}
                            onPageChange={this.handleChangePage}
                        />
                    </div>
                    <div className='flex'>
                        <div className='flex-grow'></div>
                        <div className={this.gridStyle()}
                            id="card-grid">
                            {this.state.display === "cards" && this.renderCards()}
                            {this.state.display === "products" && this.renderProducts()}
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
                </div>
            )
        }
    }

    private rarityFilter() {
        return (
            <Autocomplete
                className='pl-4 min-w-min w-72'
                multiple
                limitTags={1}
                id="rarities-sel"
                options={this.state.rarities}
                getOptionLabel={(option) => option}
                defaultValue={this.state.rareSelected}
                disableCloseOnSelect
                renderOption={(props, option, { selected }) => (
                    <li {...props} id={`option-${option.replace(" ", "-")}`} className="flex justify-items-center items-center">
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        <span>{option}</span>
                        <div className='flex-grow' />
                        <div className='m-4'>
                            {getRarity(option)}
                        </div>
                    </li>
                )}
                onChange={
                    (_, value) => {
                        this.setCollection(this.state.collection, 0, false, this.state.searchValue, value, this.state.sort)
                    }
                }
                renderInput={(params) => (
                    <TextField
                        className='focus:bg-slate-400'
                        {...params}
                        label="Rarities"
                        placeholder="Rarities"
                    />
                )}
            />
        )
    }

    private collectionDisplayToggle() {
        return (
            <ToggleButtonGroup
                className='h-10'
                value={this.state.display}
                exclusive
                onChange={(_, value) => {
                    this.setCollection(this.state.collection, 0, false, this.state.searchValue, null, null, value)
                }}>
                <ToggleButton value="cards" id="display-cards">
                    <div>Cards</div>
                </ToggleButton>
                <ToggleButton value="products" id="display-products">
                    <div>Sealed</div>
                </ToggleButton>
            </ToggleButtonGroup>
        )
    }

    private sortButtons() {
        return (
            <ToggleButtonGroup
                className='h-10'
                value={this.state.sort}
                exclusive
                onChange={(_, value) => {
                    this.setCollection(this.state.collection, 0, false, null, null, value)
                }}>
                <ToggleButton value="wish" id="sort-wish">
                    <div>Wishlist</div>
                </ToggleButton>
                <ToggleButton value="name" id="sort-name">
                    <div>Name</div>
                </ToggleButton>
                {this.state.display === "cards" &&
                    <ToggleButton value="setNumber" id="sort-set-number">
                        <div>Set #</div>
                    </ToggleButton>
                }
                {this.state.display === "cards" &&
                    <ToggleButton value="pokedex" id="sort-dex-number">
                        <Tooltip title="National Pokedex Number">
                            <div className='flex items-center'>{icon}#</div>
                        </Tooltip>
                    </ToggleButton>
                }
                <ToggleButton value="priceASC" id="sort-price-asc">
                    <Tooltip title="Price Low to High">
                        <div>$⬆︎</div>
                    </Tooltip>
                </ToggleButton>
                <ToggleButton value="priceDSC" id="sort-price-dsc">
                    <Tooltip title="Price High to Low">
                        <div>$⬇︎</div>
                    </Tooltip>
                </ToggleButton>
                <ToggleButton value="dateASC" id="sort-date-up">
                    <Tooltip title="Date High to Low">
                        <div>📅 ⬆︎</div>
                    </Tooltip>
                </ToggleButton>
                <ToggleButton value="dateDSC" id="sort-date-down">
                    <Tooltip title="Date High to Low">
                        <div>📅 ⬇︎</div>
                    </Tooltip>
                </ToggleButton>
            </ToggleButtonGroup>
        )
    }

    private fabButtons() {
        return (
            <div className='flex'>
                <Tooltip title="Add New Collection">
                    <Fab
                        size='small'
                        id="add-collection-button"
                        color="primary"
                        onClick={() => { this.setState({ addDialogOpen: true }) }}>
                        <AddIcon></AddIcon>
                    </Fab>
                </Tooltip>
                <div className='w-4'></div>
                <Tooltip title="Rename Collection">
                    <span>
                        <Fab
                            disabled={this.state.collections.length === 0}
                            size='small'
                            id="rename-collection-button"
                            color="primary"
                            onClick={() => { this.setState({ renameDialogOpen: true }) }}>
                            <EditIcon />
                        </Fab>
                    </span>
                </Tooltip>
                <div className='w-4'></div>
                <DownloadMenu name={this.state.collection}></DownloadMenu>
                <div className='w-4'></div>
                <Tooltip title="Delete Collection">
                    <span>
                        <Fab
                            disabled={this.state.collections.length === 0}
                            id="delete-collection-button"
                            size="small"
                            color="error"
                            onClick={() => { this.setState({ deleteDialogOpen: true }) }}>
                            <DeleteForeverIcon />
                        </Fab>
                    </span>
                </Tooltip>
            </div>
        )
    }

    private searchbar() {
        if (this.state.collections.length !== 0) {
            return (
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
                        {this.rarityFilter()}
                        <div className='flex-grow'></div>
                        {this.collectionDisplayToggle()}
                        <div className='w-4'></div>
                        {this.sortButtons()}
                    </div>
                </div>
            )
        }
    }

    render() {
        return (
            <div>
                <div className="flex h-16 w-full justify-center items-center pr-4 bg-gray-200">
                    {this.state.collections.length > 0 && (
                            <Tabs
                                id="collection-tabs"
                                className="flex-grow"
                                value={this.state.collection !== "" ? this.state.collection : false}
                                onChange={this.setCollectionEvent}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                {this.generateTabs()}
                            </Tabs>
                        )}
                    {this.fabButtons()}
                </div>
                <div>
                    {this.searchbar()}
                    <div className='h-[calc(100vh-13rem)] overflow-auto'>
                        {this.cardContainer()}
                    </div>
                </div>
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
                    onClose={() => { this.closeDialog() }}
                />
                <RenameDialog
                    open={this.state.renameDialogOpen}
                    name={this.state.collection}
                    collections={this.state.collections}
                    onConfirm={
                        (name) => {
                            this.setCollection(name, 0)
                        }
                    }
                    onClose={
                        () => { this.closeDialog() }
                    }
                />
            </div>
        )
    }
}