import React from 'react';
import { Price } from '../model/Card'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Collection } from '../model/Collection';


class State {
    public prices = new Array<Price>()
    public collection = new Collection("+")
    public collections = new Array<Collection>()
}

export class Collections extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props)
        this.state = new State()
        this.state.collections.push(new Collection("+"))
    }

    private setCollection = () => {}

    private generateTabs(): JSX.Element[]{
        let tabs = []
        for(let coll of this.state.collections){
           tabs.push((<Tab label={coll.name}></Tab>))
        }
        return tabs;
    }

    render() {
        return (
            <div className="w-full">
                <Tabs value={this.state.collection} onChange={this.setCollection} orientation="vertical">
                    {this.generateTabs()}
                </Tabs>
            </div>
        )
    }
}