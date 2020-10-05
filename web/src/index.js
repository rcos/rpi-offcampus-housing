import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom"

// stylesheets
import './assets/css/style.scss'
import './assets/css/layout.scss'
import './assets/css/fonts.scss'

// router paths
import App from './App.tsx';
import Test from './views/Test.tsx'

// setup routes
const Routes = () => {
  return (<Router>
    <Switch>
      <Route path="/test">
        <Test />
      </Route>
      <Route path="/">
        <App />
      </Route>
    </Switch>
  </Router>)
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
