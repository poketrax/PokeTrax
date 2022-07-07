import * as React from 'react';
import { Tooltip } from '@mui/material';
import Menu from '@mui/material/Menu';
import Fab from '@mui/material/Fab';
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/Download';
import { downloadCardPrices, downloadProductPrices } from '../controls/CardDB'
import { SealedProduct } from '../model/SealedProduct';
import { Card } from '../model/Card';

class State {
    public anchorEl?: HTMLElement
    public open: boolean = false
}

interface Props {
    item: SealedProduct | Card
    type: string
    start: Date
    end: Date
}

export default class PricesDownload extends React.Component<Props, State>  {

    constructor(props: Props) {
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
        if(this.props.type === 'card'){
            downloadCardPrices(this.props.item as Card, this.props.start, this.props.end, type)
        }else{
            downloadProductPrices(this.props.item as SealedProduct, this.props.start, this.props.end, type)
        }
        this.handleClose()
    }

    render(): React.ReactNode {
        return (
            <div>
                <Tooltip title="Download Prices">
                    <Fab
                        id="download-menu-open"
                        aria-haspopup="true"
                        size="small"
                        onClick={(ev) => this.handleClick(ev)}>
                        <DownloadIcon />
                    </Fab>
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
                    <MenuItem onClick={() => this.clickItem("json")}>JSON</MenuItem>
                    <MenuItem onClick={() => this.clickItem("csv")}>CSV/Excel</MenuItem>
                </Menu>
            </div>
        )
    }
}
