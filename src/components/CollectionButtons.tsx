import React from 'react';
import { Collection } from '../model/Collection';
import { getCollections } from '../controls/CardDB';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear'
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import {
    IconButton,
    Dialog,
    DialogTitle,
    Button,
    Autocomplete,
    TextField,
    ButtonGroup
} from '@mui/material';

interface Props {
    count: number,
    onDelete: () => void,
    onUpdate: (add: boolean) => void,
    onMove: (collection: string) => void
}

class State {
    public collections = new Array<Collection>()
    public selected = ""
    public show = false
    public err = false
}

export class CollectionButtons extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = new State()
    }
    
    componentDidMount(): void {
        getCollections().then(
            (value) => {
                this.setState({ ...this.state, collections: value })
            }
        )
    }

    private open() {
        this.setState({ ...this.state, show: true })
    }

    private handleClose() {
        this.setState({ ...this.state, show: false })
    }

    private move() {
        if (this.state.selected != null
            && this.state.selected !== ""
            && this.state.collections.find(
                (coll) => coll.name === this.state.selected
            )) {
            this.props.onMove(this.state.selected)
            this.handleClose()
        } else {
            this.setState({ ...this.state, err: true })
        }
    }

    render() {
        return (<div className="flex justify-center items-top w-full mb-2 ml-4 mr-4 " >
            <div className="flex justify-center items-center w-full h-9 border-2 rounded-md mr-2">
                {
                    this.props.count > 0 &&
                    <span id="count-display">Count: {this.props.count}</span>
                }
                {
                    this.props.count <= 0 &&
                    <span id="count-display">Wishlist</span>
                }
            </div>
            <ButtonGroup className="w-fit bg-white" variant="outlined">
                <Button
                    id="card-case-add-count"
                    className="w-4"
                    onClick={() => this.props.onUpdate(true)}>
                    <AddIcon />
                </Button>
                <Button
                    id="card-case-sub-count"
                    className="w-4"
                    onClick={() => this.props.onUpdate(false)}
                    disabled={this.props.count < 1 ? true : false}>
                    <RemoveIcon />
                </Button>
                <Button
                    id="card-case-move-button"
                    className="w-4"
                    onClick={() => { this.open() }}>
                    <DriveFileMoveIcon />
                </Button>
                <Button
                    id="card-case-delete-button"
                    className="w-4"
                    onClick={() => { this.props.onDelete() }}>
                    <DeleteIcon color="error" />
                </Button>
            </ButtonGroup>
            <Dialog
                id="move-card-dialog"

                onClose={this.handleClose}
                open={this.state.show}>
                <div className='flex justify-center items-center w-full p-2 pr-4'>
                    <DialogTitle id="move-dialog-title">
                        Move To Collection
                    </DialogTitle>
                    <div id="move-dialog-title-pad" className="flex-grow"></div>
                    <IconButton
                        id="close-move-card-dialog"
                        className="w-8 h-8"
                        size="large"
                        onClick={() => this.setState({ ...this.state, show: false })}>
                        <ClearIcon />
                    </IconButton>
                </div>
                <div className='w-96'>
                    <Autocomplete
                        id="collection-input"
                        className='w-full pl-4 pr-4'
                        options={this.state.collections}
                        getOptionLabel={(option: Collection) => option.name}
                        renderInput={(params) => (
                            <TextField
                                error={this.state.err}
                                className='focus:bg-slate-400'
                                {...params}
                                label="Collection"
                                placeholder="Collection"
                            />
                        )}
                        onInputChange={
                            (_, value) => {
                                if (value) {
                                    this.setState({ ...this.state, selected: value })
                                }
                            }
                        }
                    />
                    <div className="w-full p-4">
                        <Button
                            id="move-confirm-button"
                            className="w-full"
                            variant='contained'
                            onClick={(ev) => { this.move() }}
                            startIcon={<DriveFileMoveIcon />}>
                            Move
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>)
    }
}