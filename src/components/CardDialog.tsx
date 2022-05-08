import React from 'react';
import { Card, Price } from '../model/Card'

interface Props {
    card: Card
}

class State {
    public inProg = false
}

export class CardDialog extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = new State()
    }

    render() {
        return (
            <div className='w-96'>
                <div>Add {this.props.card.name}</div>
                
            </div>
        )
    }
}