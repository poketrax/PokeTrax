import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './pages/App';

export const baseURL: string = "http://localhost:3030"

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root')
);
