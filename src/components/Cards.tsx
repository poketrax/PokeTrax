import React from 'react';
import { Card } from '../model/Card'
import axios from 'axios'
import { baseURL } from '../index'
import { CardCase } from './CardCase'
import { Subject } from 'rxjs'
import CardSearchBar from './CardSearchBar'
import TablePagination from '@mui/material/TablePagination';

class State {
    sets: string[] = []
    rarities: string[] = []
    cards: Card[] = []
    page: number = 1
    rowsPerPage: number = 10
    count: number = 1
}

export const searchTermTopic = new Subject<string>()
export const setFilter = new Subject<string[]>()
export const rareFilter = new Subject<string[]>()

export class CardSearch extends React.Component<{}, State> {
    private searchTerm = ""
    constructor(props: object) {
        super(props)
        this.state = new State()
        axios.get(`${baseURL}/cards/1`).then(
            (res) => {
                this.setState({ ...this.state, cards: res.data.cards, count: res.data.total })
            },
            (err) => {
                console.log(err)
            }
        )
        searchTermTopic.subscribe(
            {
                next: (message) => {
                    this.searchTerm = message
                    this.search()
                }
            }
        )
    }

    private handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        this.setState({ ...this.state, page: newPage})
    };

    private handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        this.setState({...this.state, rowsPerPage: parseInt(event.target.value, 10), page: 1});
    };

    private search() {
        axios.get(`${baseURL}/cards/${this.state.page}/?name=${this.searchTerm}`).then(
            (res) => {
                this.setState({ ...this.state, cards: res.data })
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
                        <CardSearchBar></CardSearchBar>
                    </div>
                    <TablePagination
                        component="div"
                        count={this.state.count}
                        page={this.state.page}
                        onPageChange={this.handleChangePage}
                        rowsPerPage={this.state.rowsPerPage}
                        onRowsPerPageChange={this.handleChangeRowsPerPage}
                    />
                    <div className='grid w-full h-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4 mt-4'>
                        {this.renderCards()}
                    </div>
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