// reducers
import {userReducer, institutionReducer} from './user'

// reducer combiner
import {combineReducers} from 'redux'

// @ts-ignore
const allReducers = combineReducers({
  user: userReducer,
  institution: institutionReducer
})


export default allReducers
