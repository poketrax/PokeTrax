import React from 'react';
import pokeball from "../static/pokeball.svg"

function AppBar() {
    return (
        <div className="w-full h-16 bg-gray-400 flex flex-row" >
            <div className="h-16 flex-none flex flex-row">
                <img className="h-16 w-16 p-1 " src={pokeball} />
                <span className="font-sans text-3xl pt-3 pl-2">PokeTrax</span>
                <span className="pl-6 grid grid-cols-3">
                    <button>Cards</button>
                    <button>Sets</button>
                    <button>Collections</button>
                </span>
            </div>
        </div>
    );
}
export default AppBar;
