import React from 'react';
import { Card } from '../model/Card'
import { CardCase } from './CardCase'
import { Subject } from 'rxjs'
import { AppController } from './App'
import {
    TablePagination,
    Autocomplete,
    TextField,
    Checkbox,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip
} from '@mui/material';
import { CgPokemon } from "react-icons/cg"
import { MdOutlineCatchingPokemon } from "react-icons/md"
import { search, expansions, rarities, getRarity } from '../controls/CardDB'
import { baseURL } from "../index"

const icon = <CgPokemon />;
const checkedIcon = <MdOutlineCatchingPokemon />;
class State {
    sets: string[] = []
    setsSelected: string[] = []
    rareSelected: string[] = []
    cards: Card[] = []
    page: number = 0
    count: number = 0
    sort: string = ""
    rarities: string[] = []

    constructor(set?: string) {
        if (set != null) {
            this.setsSelected.push(set)
        }
    }
}
class Props {
    selectedSet: string = ""
}

export const setFilter = new Subject<string[]>()
export const rareFilter = new Subject<string[]>()
export class CardSearch extends React.Component<Props, State> {
    private searchTerm = ""
    constructor(props: Props) {
        super(props)
        this.state = new State()
        if (props.selectedSet !== '') {
            this.state = new State(props.selectedSet)
        }
    }
    
    componentDidMount() {
        AppController.next({ page: "", selectedSet: "" });
        expansions().then(
            (data) => {
                this.setState({ ...this.state, sets: data.map((exp) => exp.name) })
            }
        )
        rarities().then((value) => {
            console.log(value)
            this.setState({ ...this.state, rarities: value })
        })
        this.setSearch(0);
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

    private onSearchTerm(value: string){
        this.searchTerm = value
        this.setSearch(0)
    }

    render() {
        return (
            <div className='w-full'>
                <div className='sticky w-full h-20 bg-gray-200 flex justify-items-center items-center pl-2 pr-2 top-0'>
                    <TextField className='min-w-fit w-72'
                        id="card-test-search-bar"
                        label="Search"
                        variant="outlined"
                        onChange={(e) => {
                                this.onSearchTerm(e.target.value)
                            }
                        }/>
                    <div className='pl-4 min-w-min w-72'>
                        <Autocomplete
                            multiple
                            limitTags={1}
                            id="expantions-sel"
                            options={this.state.sets}
                            defaultValue={this.state.setsSelected}
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
                        options={this.state.rarities}
                        defaultValue={this.state.rareSelected}
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
                                <div className='flex-grow' />
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
                            <Tooltip title="National Pokedex Number">
                                <div className='flex items-center'>{icon}#</div>
                            </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="priceASC" id="sort-price-up">
                            <Tooltip title="Price Low to High">
                                <div>$⬆︎</div>
                            </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="priceDSC" id="sort-price-down">
                            <Tooltip title="Price High to Low">
                                <div>$⬇︎</div>
                            </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="dateASC" id="sort-date-up">
                            <Tooltip title="Date High to Low">
                                <div>📅⬆︎</div>
                            </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="dateDSC" id="sort-date-down">
                            <Tooltip title="Date High to Low">
                                <div>📅⬇︎</div>
                            </Tooltip>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </div>
                <div className='h-[calc(100vh-11rem)] overflow-auto'>
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
                        <div className='grid h-full grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4'
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
        return this.state.cards.map((card, i) => (
            <CardCase
                id={`${i}`}
                key={card.cardId}
                card={card}
                onDelete={() => {}}
            ></CardCase>
        ));
    }
}

export default CardSearch