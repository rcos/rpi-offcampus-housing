import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom"
import AuthRoute from './modules/auth/AuthRoute'
import AccessLevels from './modules/auth/accessLevels.json'
import { config } from './config'

// stylesheets
import './assets/css/style.scss'
import './assets/css/layout.scss'
import './assets/css/fonts.scss'

// router paths
import SearchView from './views/Search'
import LandlordLoginView from './views/LandlordLogin'
import LandlordRegisterView from './views/LandlordRegister'
// import CollectionView from './views/Collection'
// import StudentRegisterView from './views/StudentRegister'
import NotFound from './views/NotFound'
import LandingView from './views/Landing'
import AlertContext from './components/context/AlertContext'
import AlertController from './components/AlertController'
import PropertyView from './views/Property'
import StudentLoginView from './views/StudentLoginView'
import StudentRegisterComplete from './views/StudentRegisterCompleteView'
import LandlordDashboard from './views/LandlordDashboard'

import StudentCASAuth from './modules/redirects/StudentCASAuth'

// Redux setup
import store from './redux/store'
import {Provider} from 'react-redux'

// setup routes
const Routes = () => {

  const [alertCtxValue, setAlertCtxValue] = useState({id: 0, value: "", data: null})
  const successAlert = (data) => {
    setAlertCtxValue({
      id: alertCtxValue.id + 1,
      type: 'success',
      data
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

          {/* Unrestricted Paths */}
          <AuthRoute accessLevel={AccessLevels.UNAUTH} exact path="/" component={LandingView} />
          <AuthRoute accessLevel={AccessLevels.UNAUTH} exact path="/student/auth-cas" component={StudentCASAuth} />
          <AuthRoute accessLevel={AccessLevels.UNAUTH} exact path="/landlord/login" component={LandlordLoginView} />
          <AuthRoute accessLevel={AccessLevels.UNAUTH} exact path="/student/login" component={StudentLoginView} />
          <AuthRoute accessLevel={AccessLevels.UNAUTH} exact path="/landlord/register" component={LandlordRegisterView} />
          
          {/* Restricted Paths */}
            {/* Student Only  */}
            <AuthRoute accessLevel={AccessLevels.STUDENT} exact path="/student/register/complete" component={StudentRegisterComplete} />
            <AuthRoute accessLevel={AccessLevels.STUDENT} exact path="/search" component={SearchView} />

            {/* Landlord Only */}
            <AuthRoute accessLevel={AccessLevels.LANDLORD} exact path="/landlord/dashboard" component={LandlordDashboard} />

            {/* Landlord and Student */}
            <AuthRoute accessLevel={AccessLevels.STUDENT_AND_LANDLORD} exact path="/property/:id" component={({match}) => (<PropertyView property_id={match.params.id} />)} />
          
          {/* 404 */}
          <Route component={NotFound} />
        </Switch>
    </AlertContext.Provider>
  </Router>)
}

config ()
ReactDOM.render(
  <Provider store={store}>
    <Routes />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
