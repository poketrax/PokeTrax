import React from 'react';
import './App.css';
import pokeball from "./static/pokeball.svg"
import Cards from "./components/Cards"
import {Expansions} from "./components/Expansions"
class State {
    page: string = "cards"
}
export class App extends React.Component<{}, State> {
  constructor(props: object) {
      super(props)
      this.state = { page: "cards" }
  }

  setPage(page: string) {
      this.setState({ ...this.state, page: page })
  }

  render() {
      let content;
      if (this.state.page === "cards") {
          content = (<Cards></Cards>)
      }else if(this.state.page === "sets"){
          content = (<Expansions></Expansions>)
      }else if(this.state.page === "collections"){
          content = <div>Collections</div>
      }
      return (
          <div>
              <div className="w-full h-16 bg-gray-400 flex flex-row" >
                  <div className="h-16 flex-none flex flex-row">
                      <img className="h-16 w-16 p-1 " src={pokeball} />
                      <span className="font-sans text-3xl pt-3 pl-2">PokéTrax</span>
                      <span className="pl-6 grid grid-cols-3">
                          <button className='hover:text-red-600' onClick={() => this.setPage("cards")}>Cards</button>
                          <button className='hover:text-red-600' onClick={() => this.setPage("sets")}>Sets</button>
                          <button className='hover:text-red-600' onClick={() => this.setPage("collections")}>Collections</button>
                      </span>
                  </div>
              </div>
              <div className=''>
                  {content}
              </div>
          </div>
      )
  }
}

export default App