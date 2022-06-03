import React from 'react';
import { Card } from '../model/Card';
import { openLink } from '../controls/CardDB'

interface Props {
    card: Card
    type: string
}

export class CardBuyLink extends React.Component<Props, {}> {

    private getImage(){
        switch(this.props.type){
            case 'tcgp' :
                return (<img src="assests/tcgp.png" alt="tcgp"/>)
            case 'ebay' :
                return (<img src="assests/ebay.png" alt="ebay"/>)
            default:
                return {}
        }
    }

    private onclick(){
        openLink(this.props.type, this.props.card)
    }

    render() {
        return (
            <div className='w-20 border-2 rounded-lg p-2 hover:shadow-2xl' 
                onClick={() => this.onclick()}> 
                {this.getImage()}
            </div>
        )
    }
}