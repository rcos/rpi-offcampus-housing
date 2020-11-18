import AuthAPI from '../../API/AuthAPI'
import {Student} from '../../API/queries/types/graphqlFragmentTypes'

export interface StudentInfo {
  user: Student | null
  authenticated: boolean
  type?: "student" | "landlord"
}

export interface UserActionType {
  user: StudentInfo | null
  type: string
}

const getUser = (): UserActionType => ({ type: 'GET_USER', user: null })
const recievedUser = (user_: StudentInfo): UserActionType => ({ type: 'RECIEVED_USER', user: user_ })

const fetchUser = (user: any, {update}: {update: boolean}) => {
 return function (dispatch: Function) {

  if (user == null || update) {
    dispatch(getUser())
    return AuthAPI.getUser()
    .then(user_data => user_data.data)
    .then(user_ => {

      // user is authenticated on our server
      if (user_.authenticated && user_.user) {
        let user_data: Student =  {
          _id: user_.user._id,
          first_name: user_.user.first_name,
          last_name: user_.user.last_name,
          email: user_.user.email,
          phone_number: user_.user.phone_number,
          auth_info: {
            cas_id: user_.user.auth_info.cas_id,
            institution_id: user_.user.auth_info.institution_id
          },
          saved_collection: user_.user.saved_collection
        }
  
        let student_auth: StudentInfo = {
          user: user_data,
          authenticated: true,
          type: "student"
        }
  
        dispatch(recievedUser(student_auth))
      }

      // user is not authenticated on our server
      else {
        dispatch(recievedUser({
          user: null,
          authenticated: false
        }))
      }
    }) 
  }

 } 
}

const setInstitution = (institution: any) => {
  if (institution == null) return ({type: 'UNDEFINED'})
  return ({type: 'SET_INSTITUTION', institution: institution})
}

export {getUser, fetchUser, setInstitution}