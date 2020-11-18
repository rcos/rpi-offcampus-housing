// reducers
import {userReducer, institutionReducer} from './user'
import {StudentInfo} from '../actions/user'

// reducer combiner
import {combineReducers} from 'redux'

// @ts-ignore
const allReducers = combineReducers({
  user: userReducer,
  institution: institutionReducer
})

export type ReduxState = {
  user: StudentInfo | null
  institution: any
}
export default allReducers
