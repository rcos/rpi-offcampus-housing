import allReducers from './reducers/all_reducers'
import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'

const composeEnhancers =
  typeof window === 'object' &&
  // @ts-ignore
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
    }) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(thunk)
)

let store = createStore(allReducers, enhancer)

export default store