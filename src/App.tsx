import React from 'react';
import './App.css';
import AppContainer from './components/AppContainer';
import { CardDB } from "./controls/CardDB"

export const DB = new CardDB("./data")
function App() {
  return (
    <div className="App ">
      <AppContainer></AppContainer>
    </div>
  );
}

export default App;
