import ReactDOMLite from '../../src/'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';


let renderer;
// renderer = ReactDOM;
renderer = ReactDOMLite;
console.log(renderer);
renderer.render(
  <App />,
  document.getElementById('container')
);
