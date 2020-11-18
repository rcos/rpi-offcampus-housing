import {StudentInfo, LandlordInfo, UserActionType} from '../actions/user'

const userReducer = (state = null, action: UserActionType): LandlordInfo | StudentInfo | null => {

  switch(action.type) {
    case 'GET_USER':
      return state == null ? action.user : state;
      
    case 'RECIEVED_USER':
      return action.user
      
  }

  return null

}

const institutionReducer = (state = null, action: any) => {
  switch(action.type) {
    case 'SET_INSTITUTION':
      return action.institution
    default:
      return state
  }
}

export { userReducer, institutionReducer }