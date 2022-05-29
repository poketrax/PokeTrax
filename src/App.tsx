import React from 'react';
import './App.css';
import Cards from "./components/CardSearch"
import { Expansions } from "./components/Expansions"
import LinearProgress from '@mui/material/LinearProgress';
import { Subject, timer } from 'rxjs'
import { DbState, getDbState } from './controls/CardDB';
import { Collections } from './components/Collections';

class State {
    page: string = ""
    selectedSet: string = ""
    dbState: DbState = new DbState()
}

export interface AppControl {
    page: string
    selectedSet: string
}

export const AppController = new Subject<AppControl>()
export class App extends React.Component<{}, State> {
    constructor(props: object) {
        super(props)
        this.state = new State()
        AppController.subscribe(
            (msg) => {
                this.setPage(msg.page, msg.selectedSet)
            }
        )
        //checks to see if update is happing
        let dbcheck = timer(0, 100).subscribe(
            () => {
                getDbState().then(
                    (state) => {
                        this.setState({ ...this.state, dbState: state })
                        if (state.ready) {
                            this.setPage('cards')
                            dbcheck.unsubscribe()
                        }
                    }
                )
            }
        )
    }

    setPage(page: string, selectedSet?: string) {
        if (this.state.dbState.ready !== false) {
            this.setState({
                ...this.state,
                page: page ?? this.state.page,
                selectedSet: selectedSet ?? this.state.selectedSet
            })
        }
    }

    render() {
        let content;
        let message;
        switch (this.state.page) {
            case 'cards':
                content = (<Cards selectedSet={this.state.selectedSet}></Cards>)
                break
            case 'sets':
                content = (<Expansions></Expansions>)
                break
            case 'collections':
                content = <Collections></Collections>
                break
            default:
                message = (this.state.dbState.updated ? "Downloading New Data" : "Loading Database") + "...";
                content = (
                    <div className='absolute justify-items-center items-center w-full'>
                        <LinearProgress id="app-loading-bar"></LinearProgress>
                        <div className='h-16'></div>
                        <div className='flex'>
                            <div className='grow'></div>
                            <span className='text-2xl' id="loading-message">{message}</span>
                            <div className='grow'></div>
                        </div>
                    </div>
                )
        }
        return (
            <div>
                <div className="sticky top-0 w-full h-16 bg-gray-400 flex flex-row">
                    <div className="h-16 flex-none flex flex-row">
                        <img className="h-16 w-16 p-1" src={"./assests/poketrax.png"} alt="" />
                        <span className="font-sans text-3xl pt-3 pl-2">PokéTrax</span>
                        <span className="pl-6 grid grid-cols-3">
                            <button id="cards-page" className='hover:text-blue-700' onClick={() => this.setPage("cards")}>Cards</button>
                            <button id="sets-page" className='hover:text-blue-700' onClick={() => this.setPage("sets")}>Sets</button>
                            <button id="collection-page" className='hover:text-blue-700' onClick={() => this.setPage("collections")}>Collections</button>
                        </span>
                    </div>
                </div>

                {content}
            </div>
        )
    }
}

export default App