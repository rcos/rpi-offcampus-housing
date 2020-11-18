// reducers
import {userReducer, institutionReducer} from './user'
import {StudentInfo, LandlordInfo} from '../actions/user'

// reducer combiner
import {combineReducers} from 'redux'

// @ts-ignore
const allReducers = combineReducers({
  user: userReducer,
  institution: institutionReducer
})

export type ReduxState = {
  user: LandlordInfo | StudentInfo | null
  institution: any
}
export default allReducers

export const isLandlord = (user: LandlordInfo | StudentInfo | null): boolean => {
  return user != undefined && user.type != undefined && user.type == "landlord";
}

export const isStudent = (user: LandlordInfo | StudentInfo | null): boolean => {
  return user != undefined && user.type != undefined && user.type == "student";
}
