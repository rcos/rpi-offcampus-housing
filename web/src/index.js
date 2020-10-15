import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom"
import ReactCSSTransitionGroup from 'react-transition-group';

// stylesheets
import './assets/css/style.scss'
import './assets/css/layout.scss'
import './assets/css/fonts.scss'

// router paths
import SearchView from './views/Search'
import LandlordLoginView from './views/LandlordLogin'
import LandlordRegisterView from './views/LandlordRegister'
import NotFound from './views/NotFound'
import LandingView from './views/Landing'
import AlertContext from './components/context/AlertContext';
import AlertController from './components/AlertController'

// setup routes
const Routes = () => {

  const [alertCtxValue, setAlertCtxValue] = useState({id: 0, value: ""})
  const successAlert = (msg) => {
    setAlertCtxValue({
      id: alertCtxValue.id + 1,
      value: msg,
      type: 'success'
    })
  }

  const errorAlert = (msg) => {
    setAlertCtxValue({
      id: alertCtxValue.id + 1,
      value: msg,
      type: 'error'
    })
  }

  return (<Router>
    <AlertContext.Provider value={{
      successAlert: successAlert,
      errorAlert: errorAlert
    }}>
      <AlertController alertInfo={alertCtxValue} />
        <Switch>
          <Route exact path="/landlord/login">
            <LandlordLoginView />
          </Route>
          <Route exact path="/landlord/register">
            <LandlordRegisterView />
          </Route>
          <Route exact path="/search">
            <SearchView />
          </Route>
          <Route exact path="/">
            <LandingView />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
    </AlertContext.Provider>
  </Router>)
}

ReactDOM.render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
