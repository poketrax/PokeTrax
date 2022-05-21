import React from 'react';
import { Card } from '../model/Card'
import { CardCase } from './CardCase'
import { Subject } from 'rxjs'
import TablePagination from '@mui/material/TablePagination';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { CgPokemon } from "react-icons/cg"
import { MdOutlineCatchingPokemon } from "react-icons/md"
import { search, expansions, rarities, getRarity } from '../controls/CardDB'
import { baseURL } from "../index";

const icon = <CgPokemon/>;
const checkedIcon = <MdOutlineCatchingPokemon />;
class State {
    sets: string[] = []
    setsSelected: string[] = []
    rareSelected: string[] = []
    cards: Card[] = []
    page: number = 0
    count: number = 0
    sort: string = ""
}
class Props {
    selectedSet?: string
}

export const setFilter = new Subject<string[]>()
export const rareFilter = new Subject<string[]>()
export class CardSearch extends React.Component<Props, State> {
    private searchTerm = ""
    constructor(props: Props) {
        super(props)
        this.state = new State()
        if (typeof props.selectedSet === 'string') {
            this.setSearch(0, [props.selectedSet])
        } else {
            this.setSearch(0)
        }
        expansions().then(
            (data) => {
                this.setState({ ...this.state, sets: data.map((exp) => exp.name) })
            }
        )
    }

    private handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number,) => {
        this.setSearch(newPage)
    };

    private setSearch(page?: number, sets?: string[], rareSelected?: string[], sort?: string) {
        search(page ?? this.state.page, this.searchTerm, sets ?? this.state.setsSelected, rareSelected ?? this.state.rareSelected, sort ?? this.state.sort).then(
            (res) => {
                this.setState(
                    {
                        ...this.state,
                        cards: res.cards,
                        sort: (sort ?? this.state.sort),
                        page: (page ?? this.state.page),
                        setsSelected: (sets ?? this.state.setsSelected),
                        rareSelected: (rareSelected ?? this.state.rareSelected),
                        count: res.total
                    }
                )
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
                    <div className='w-full h-20 bg-gray-200 flex justify-items-center items-center pl-2 pr-2'>
                        <TextField className='min-w-fit w-72'
                            id="card-test-search-bar"
                            label="Search"
                            variant="outlined"
                            onChange={(e) => this.searchTerm = e.target.value}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    this.setSearch(0)
                                }
                            }} />
                        <div className='pl-4 min-w-min w-72'>
                            <Autocomplete
                                multiple
                                limitTags={1}
                                id="expantions-sel"
                                options={this.state.sets}
                                getOptionLabel={(option) => option}
                                defaultValue={this.state.setsSelected}
                                disableCloseOnSelect
                                renderOption={(props, option, { selected }) => (
                                    <li {...props} id={`option-${option.replace(" ", "-")}`} >
                                        <div className='flex justify-center items-center w-full'>
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            <span>{option}</span>
                                            <div className='flex-grow'></div>
                                            <img className='h-6' alt="" src={baseURL + "/expSymbol/" + option} />
                                        </div>
                                    </li>
                                )}
                                onChange={
                                    (_, value) => {
                                        console.log(value)
                                        this.setSearch(0, value)
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
                        </div>
                        <Autocomplete
                            className='pl-4 min-w-min w-72'
                            multiple
                            limitTags={1}
                            id="rarities-sel"
                            options={rarities}
                            getOptionLabel={(option) => option}
                            defaultValue={this.state.setsSelected}
                            disableCloseOnSelect
                            renderOption={(props, option, { selected }) => (
                                <li {...props} id={`option-${option.replace(" ", "-")}`} className="flex justify-items-center items-center">
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    <span>{option}</span>
                                    <div className='flex-grow'/>
                                    <div className='m-4'>
                                        {getRarity(option)}
                                    </div>
                                </li>
                            )}
                            onChange={
                                (_, value) => {
                                    this.setSearch(0, this.state.setsSelected, value)
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
                        <div className='flex-grow w-6'></div>
                        <ToggleButtonGroup
                            className='h-14'
                            value={this.state.sort}
                            exclusive
                            onChange={(_, value) => {
                                this.setSearch(0, this.state.setsSelected, this.state.rareSelected, value)
                            }}>
                            <ToggleButton value="name" id="sort-name">
                                <div>Name</div>
                            </ToggleButton>
                            <ToggleButton value="setNumber" id="sort-set-number">
                                <div>Set #</div>
                            </ToggleButton>
                            <ToggleButton value="pokedex" id="sort-dex-number">
                                <div>Dex #</div>
                            </ToggleButton>
                            <ToggleButton value="priceASC" id="sort-price">
                                <div>$ ⬆︎</div>
                            </ToggleButton>
                            <ToggleButton value="priceDSC" id="sort-price">
                                <div>$ ⬇︎</div>
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                    <TablePagination
                        id="card-search-pagination"
                        component="div"
                        count={this.state.count}
                        page={this.state.page}
                        rowsPerPage={25}
                        rowsPerPageOptions={[25]}
                        onPageChange={this.handleChangePage}
                    />
                    <div className='flex'>
                        <div className='flex-grow'></div>
                        <div className='grid h-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4'
                            id="card-grid">
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
        for (let i = 0; i < this.state.cards.length; i++) {
            let card = this.state.cards[i]
            items.push(<CardCase id={`${i}`} card={card} onDelete={() => {}} ></CardCase>)
        }
        return items
    }
}

export default CardSearch