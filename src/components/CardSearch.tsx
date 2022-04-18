import React from 'react';
import { Card } from '../model/Card'
import { CardCase } from './CardCase'
import { Subject } from 'rxjs'
import TablePagination from '@mui/material/TablePagination';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import { CgPokemon } from "react-icons/cg"
import { MdOutlineCatchingPokemon } from "react-icons/md"
import { search, expansions, rarities, getRarity } from '../controls/CardDB'
import { Expansion } from '../model/Meta';

const icon = <CgPokemon />;
const checkedIcon = <MdOutlineCatchingPokemon />;
class State {
    sets: Expansion[] = []
    setsSelected: Expansion[] = []
    rareSelected: string[] = []
    cards: Card[] = []
    page: number = 0
    count: number = 0
}

class Props {
    sets: Expansion[] = []
}

export const setFilter = new Subject<string[]>()
export const rareFilter = new Subject<string[]>()
export class CardSearch extends React.Component<Props, State> {
    private searchTerm = ""
    constructor(props: Props) {
        super(props)
        this.state = new State()
        this.search(0, props.sets)
        expansions().then(
            (data) => {
                this.setState({ ...this.state, sets: data })
            }
        )
    }

    private handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number,) => {
        console.log(newPage)
        this.search(newPage)
    };

    private search(page?: number, sets?: Expansion[], rareSelected?: string[]) {
        search(page ?? this.state.page, this.searchTerm, sets ?? this.state.setsSelected, rareSelected ?? this.state.rareSelected).then(
            (res) => {
                this.setState(
                    {
                        ...this.state,
                        cards: res.cards,
                        page: (page ?? this.state.page),
                        setsSelected: (sets ?? this.state.setsSelected),
                        rareSelected: (rareSelected ?? this.state.rareSelected),
                        count: res.total
                    })
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
                        <TextField className='w-96'
                            id="outlined-basic"
                            label="Search"
                            variant="outlined"
                            onChange={(e) => this.searchTerm = e.target.value}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    this.search(0)
                                }
                            }} />
                        <Autocomplete
                            className='w-96 pl-4'
                            multiple
                            limitTags={1}
                            id="expantions"
                            options={this.state.sets}
                            getOptionLabel={(option) => option.name}
                            defaultValue={[]}
                            disableCloseOnSelect
                            renderOption={(props, option, { selected }) => (
                                <li {...props}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option.name}
                                </li>
                            )}
                            onChange={
                                (_, value) => {
                                    console.log(value)
                                    this.search(0, value)
                                }
                            }
                            renderInput={(params) => (
                                <TextField
                                    className='focus:bg-slate-400'
                                    {...params}
                                    label="Expansions"
                                    placeholder="Expansions"
                                />
                            )}
                        />
                        <Autocomplete
                            className='pl-4 w-72'
                            multiple
                            limitTags={1}
                            id="expantions"
                            options={rarities}
                            getOptionLabel={(option) => option}
                            defaultValue={[]}
                            disableCloseOnSelect
                            renderOption={(props, option, { selected }) => (
                                <li {...props} className="flex justify-items-center items-center">
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    <span>{option}</span>
                                    <div className='flex-grow' />
                                    <div className='m-4'>
                                        {getRarity(option)}
                                    </div>
                                </li>
                            )}
                            onChange={
                                (_, value) => {
                                    this.search(0, this.state.setsSelected, value)
                                }
                            }
                            renderInput={(params) => (
                                <TextField
                                    className='focus:bg-slate-400'
                                    {...params}
                                    label="Rarities"
                                    placeholder="Rarities"
                                />
                            )}
                        />
                    </div>
                    <TablePagination
                        component="div"
                        count={this.state.count}
                        page={this.state.page}
                        rowsPerPage={25}
                        rowsPerPageOptions={[25]}
                        onPageChange={this.handleChangePage}
                    />
                    <div className='flex'>
                        <div className='flex-grow'></div>
                        <div className='grid h-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4'>
                            {this.renderCards()}
                        </div>
                        <div className='flex-grow'></div>
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