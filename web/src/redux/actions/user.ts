import AuthAPI from '../../API/AuthAPI'
import {Student, Landlord} from '../../API/queries/types/graphqlFragmentTypes'

export interface StudentInfo {
  user: Student | null
  authenticated: boolean
  type?: "student"
}

export interface LandlordInfo {
  user: Landlord | null
  authenticated: boolean
  type?: "landlord"
}

export interface UserActionType {
  user: StudentInfo | LandlordInfo | null
  type: string
}

const getUser = (): UserActionType => ({ type: 'GET_USER', user: null })
const recievedUser = (user_: StudentInfo | LandlordInfo): UserActionType => ({ type: 'RECIEVED_USER', user: user_ })

const fetchUser = (user: any, {update}: {update: boolean}) => {
 return function (dispatch: Function) {

  if (user == null || update) {
    dispatch(getUser())
    return AuthAPI.getUser()
    .then(user_data => user_data.data)
    .then(user_ => {

      // user is authenticated on our server
      if (user_ && user_.authenticated && user_.user && user_.user.type) {
        
        if (user_.user.type == "student") {
          let user_data: Student = {
            _id: user_.user._id,
            first_name: user_.user.first_name,
            last_name: user_.user.last_name,
            email: user_.user.email,
            phone_number: user_.user.phone_number,
            auth_info: {
              cas_id: user_.user.auth_info.cas_id,
              institution_id: user_.user.auth_info.institution_id
            },
            saved_collection: user_.user.saved_collection,
            elevated_privileges: user_.user.elevated_privileges
          }
    
          let student_auth: StudentInfo = {
            user: user_data,
            authenticated: true,
            type: "student"
          };
    
          dispatch(recievedUser(student_auth));
        }

        else if (user_.user.type == "landlord") {
          let user_data: Landlord = {
            _id: user_.user._id,
            first_name: user_.user.first_name,
            last_name: user_.user.last_name,
            email: user_.user.email,
            phone_number: user_.user.phone_number,
            password: "",
            confirmation_key: user_.user.confirmation_key
          }

          let landlord_auth: LandlordInfo = {
            user: user_data,
            authenticated: true,
            type: "landlord"
          }
          dispatch(recievedUser(landlord_auth));
        }

      }

      // user is not authenticated on our server
      else {
        dispatch(recievedUser({
          user: null,
          authenticated: false
        }))
      }
    }) 
    .catch(err => {
      console.log(`Error in FetchUser`)
      console.log(err)
    })
  }

 } 
}

const setInstitution = (institution: any) => {
  if (institution == null) return ({type: 'UNDEFINED'})
  return ({type: 'SET_INSTITUTION', institution: institution})
}

export {getUser, fetchUser, setInstitution}