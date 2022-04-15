import React from 'react';
import { Card } from '../model/Card'
import axios from 'axios'
import { baseURL } from '../index'
import { CardCase } from './CardCase'
import { Subject } from 'rxjs'
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';

class State {
    sets: string[] = []
    rarities: string[] = []
    cards: Card[] = []
    page: number = 0
    count: number = 0
}

export const setFilter = new Subject<string[]>()
export const rareFilter = new Subject<string[]>()
export class CardSearch extends React.Component<{}, State> {
    private searchTerm = ""
    constructor(props: object) {
        super(props)
        this.state = new State()
        this.search(0)
    }

    private handleChangePage = ( _event: React.MouseEvent<HTMLButtonElement> | null, newPage: number,) => 
    {
        console.log(newPage)
        this.search(newPage)
    };

    private search(page?: number) {
        axios.get(`${baseURL}/cards/${page ?? this.state.page}/?name=${this.searchTerm}`).then(
            (res) => {
                this.setState({ ...this.state, cards: res.data.cards, page: (page ?? this.state.page), count: res.data.total})
            },
            (err) => {
                console.log(err)
            }
        )
    }

    render() {
        return (
            <div>
                <div className='w-full h-full'>
                    <div className='w-full h-20 bg-gray-200 flex justify-items-center items-center pl-2'>
                        <TextField 
                        id="outlined-basic" 
                        label="Search" 
                        variant="outlined"
                        onChange={(e) => this.searchTerm = e.target.value}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              this.search(0)
                            }
                          }}/>
                    </div>
                    <TablePagination
                        component="div"
                        count={this.state.count}
                        page={this.state.page}
                        rowsPerPage={25}
                        rowsPerPageOptions={[25]}
                        onPageChange={this.handleChangePage}
                    />
                    <div className='grid w-full h-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4 mt-4'>
                        {this.renderCards()}
                    </div>
                    <TablePagination
                        component="div"
                        count={this.state.count}
                        page={this.state.page}
                        rowsPerPage={25}
                        rowsPerPageOptions={[25]}
                        onPageChange={this.handleChangePage}
                    />
                </div>
            </div>
        )
    }

    renderCards() {
        let items = []
        for (let card of this.state.cards) {
            items.push(<CardCase card={card}></CardCase>)
        }
        return items
    }

}

export default CardSearch