import * as React from 'react';
import { Tooltip } from '@mui/material';
import Menu from '@mui/material/Menu';
import Fab from '@mui/material/Fab';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/Download';
import { Collection } from '../model/Collection';
import { downloadCollection } from '../controls/CardDB'

class State {
    public anchorEl?: HTMLElement
    public open: boolean = false
}

export default class DownloadMenu extends React.Component<Collection, State>  {

    constructor(props: Collection) {
        super(props)
        this.state = new State()
    }

    private handleClick(event: React.MouseEvent<HTMLElement>) {
        this.setState({ ...this.state, anchorEl: event.currentTarget, open: true });
    }
    private handleClose() {
        this.setState({ ...this.state, open: false });
    }

    private clickItem(type: string) {
        downloadCollection(this.props.name, type)
        this.handleClose()
    }

    render(): React.ReactNode {
        return (
            <div>
                <Tooltip title="Download Collection">
                    <span>
                        <Fab
                            disabled={this.props.name === ""}
                            id="download-menu-open"
                            aria-haspopup="true"
                            size="small"
                            color="primary"
                            onClick={(ev) => this.handleClick(ev)}>
                            <DownloadIcon />
                        </Fab>
                    </span>
                </Tooltip>
                <Menu
                    id="download-menu"
                    aria-labelledby="demo-positioned-button"
                    anchorEl={this.state.anchorEl}
                    open={this.state.open}
                    onClose={() => this.handleClose()}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <MenuItem onClick={() => this.clickItem("JSON")}>JSON</MenuItem>
                    <MenuItem onClick={() => this.clickItem("CSV")}>CSV/Excel</MenuItem>
                    <MenuItem onClick={() => this.clickItem("txt-TCGP")}>TCG Player Mass Entry</MenuItem>
                </Menu>
            </div>
        )
    }
}
