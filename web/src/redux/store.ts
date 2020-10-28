import allReducers from './reducers/all_reducers'
import {createStore} from 'redux'

let store = createStore(allReducers, 
  // @ts-ignore
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

export default store