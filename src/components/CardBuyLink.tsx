import React from 'react';
import { Card } from '../model/Card';


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
        switch(this.props.type){
            case 'tcgp' :
                window.open('https://tcgplayer.com/product/' + this.props.card?.idTCGP)
                break;
            case 'ebay' :
                window.open(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(this.props.card?.cardId)}&siteid=0&campid=5338928550&customid=&toolid=10001&mkevt=1`)
                break;
            default:
        }
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