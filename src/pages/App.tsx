import React from "react";
import "../index.css";
import Cards from "./CardSearch";
import { Expansions } from "./Expansions";
import LinearProgress from "@mui/material/LinearProgress";
import { Subject, timer } from "rxjs";
import { DbState, getDbState, openLink } from "../controls/CardDB";
import { Collections } from "./Collections";
import { ProductSearch } from "./ProductSearch";
import Snackbar from "@mui/material/Snackbar";

import { Button } from "@mui/material";

class State {
    page: string = "";
    selectedSet: string = "";
    dbState: DbState = new DbState();
}

export interface AppControl {
    page: string;
    selectedSet: string;
}

export const AppController = new Subject<AppControl>();
export class App extends React.Component<{}, State> {
    constructor(props: object) {
        super(props);
        this.state = new State();
    }

    componentDidMount(): void {
        AppController.subscribe({
            next: (msg) => {
                if (msg.selectedSet === "") {
                    this.setState({ ...this.state, selectedSet: "" });
                } else {
                    this.setPage(msg.page, msg.selectedSet);
                }
            },
        });
        //checks to see if update is happing
        let dbcheck = timer(0, 100).subscribe(() => {
            getDbState().then((state) => {
                this.setState({ ...this.state, dbState: state });
                if (state.ready) {
                    this.setPage("cards");
                    dbcheck.unsubscribe();
                }
            });
        });
    }

    private titleBar() {
        return (
            <div className="sticky top-0 w-full h-16 bg-gray-400 flex flex-row">
                <div className="h-16 flex-none flex flex-row">
                    <img
                        className="h-16 w-16 p-1"
                        src={"./assests/poketrax.png"}
                        alt=""
                    />
                    <span className="font-sans text-3xl pt-3 pl-2">
                        PokéTrax
                    </span>
                    <span className="pl-6 flex ">
                        <button
                            id="cards-page"
                            className="hover:text-blue-700"
                            onClick={() => this.setPage("cards")}
                        >
                            Cards
                        </button>
                        <div className="w-6"></div>
                        <button
                            id="sets-page"
                            className="hover:text-blue-700"
                            onClick={() => this.setPage("sets")}
                        >
                            Sets
                        </button>
                        <div className="w-6"></div>
                        <button
                            id="sealed-page"
                            className="hover:text-blue-700"
                            onClick={() => this.setPage("sealed")}
                        >
                            Sealed Products
                        </button>
                        <div className="w-6"></div>
                        <button
                            id="collection-page"
                            className="hover:text-blue-700"
                            onClick={() => this.setPage("collections")}
                        >
                            Collections
                        </button>
                    </span>
                </div>
            </div>
        );
    }

    private setPage(page: string, selectedSet?: string) {
        if (this.state.dbState.ready !== false) {
            this.setState({
                ...this.state,
                page: page ?? this.state.page,
                selectedSet: selectedSet ?? this.state.selectedSet,
            });
        }
    }

    private newVersionPopup() {
        return (
            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={this.state.dbState.newSoftware}
                onClose={() => {
                    this.setState({
                        ...this.state,
                        dbState: {
                            ready: this.state.dbState.ready,
                            updated: this.state.dbState.updated,
                            newSoftware: false,
                        },
                    });
                }}
                message="New Version Available!! "
                action={
                    <Button onClick={() => openLink("newSoftware", null)}>
                        Download
                    </Button>
                }
            />
        );
    }

    private content() {
        let message;
        let content;
        switch (this.state.page) {
            case "cards":
                content = <Cards selectedSet={this.state.selectedSet}></Cards>;
                break;
            case "sets":
                content = <Expansions></Expansions>;
                break;
            case "collections":
                content = <Collections></Collections>;
                break;
            case "sealed":
                content = <ProductSearch></ProductSearch>;
                break;
            default:
                message =
                    (this.state.dbState.updated
                        ? "Downloading New Data"
                        : "Loading Database") + "...";
                content = (
                    <div className="absolute justify-items-center items-center w-full">
                        <LinearProgress id="app-loading-bar"></LinearProgress>
                        <div className="h-16"></div>
                        <div className="flex">
                            <div className="grow"></div>
                            <span className="text-2xl" id="loading-message">
                                {message}
                            </span>
                            <div className="grow"></div>
                        </div>
                    </div>
                );
        }
        return content;
    }

    render() {
        return (
            <div>
                {this.titleBar()}
                {this.newVersionPopup()}
                {this.content()}
                <div className="text-xs">
                    The information presented on this application about the
                    Pokémon Trading Card Game, including images and text, is
                    copyright of The Pokémon Company, Nintendo, Game Freak,
                    Creatures and/or Wizards of the Coast. This website is not
                    produced by, endorsed by, supported by, or affiliated with
                    any of these companies.
                </div>
            </div>
        );
    }
}

export default App;
