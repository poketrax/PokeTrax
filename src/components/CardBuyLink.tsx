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
                return (<img className='object-contain' src="assests/tcgp.png" alt="tcgp"/>)
            case 'ebay' :
                return (<img className='object-contain' src="assests/ebay.png" alt="ebay"/>)
            default:
                return {}
        }
    }

    private onclick(){
        openLink(this.props.type, this.props.card)
    }

    render() {
        return (
            <div className='flex w-20 h-10 border-2 rounded-lg p-2 hover:shadow-2xl align-middle justify-center' 
                onClick={() => this.onclick()}> 
                {this.getImage()}
            </div>
        )
    }
}