import React from 'react';

class State {
    searchTerm: string = ""
    sets: string[] = []
    rarities: string[] = []
}

export class CardSearch extends React.Component<{}, State> {
    constructor(props: object) {
        super(props)
        this.state = new State()
    }

    setSearchTerm(searchTerm: string) {
        this.setState({ ...this.state, searchTerm: searchTerm })
    }

    setSets(sets: string[]){
        this.setState({ ...this.state, sets: sets })
    }

    setRarities(rarities: string[]){
        this.setState({ ...this.state, rarities: rarities })
    }

    render() {
        return (
            <div>
                <div className='flex'>
                    {}
                </div>
            </div>
        )
    }
}

export default CardSearch