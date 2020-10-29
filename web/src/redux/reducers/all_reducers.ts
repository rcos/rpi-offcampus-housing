// reducers
import {userReducer} from './user'

// reducer combiner
import {combineReducers} from 'redux'

// @ts-ignore
const allReducers = combineReducers({
  // @ts-ignore
  user: userReducer
})


export default allReducers
