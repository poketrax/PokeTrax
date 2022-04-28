import React from 'react';
import { Card, Price } from '../model/Card'
import  Paper  from '@mui/material/Paper';

interface Props {
    card: Card
}

class State {
    public prices = new Array<Price>()
}

export class CardDialog extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = new State()
    }

    render() {
        return (
            <div>
                <Paper>
                    
                </Paper>
            </div>
        )
    }
}