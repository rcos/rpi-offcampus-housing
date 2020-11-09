import AuthAPI from '../../API/AuthAPI'

const getUser = () => ({ type: 'GET_USER' })
const recievedUser = (user_: any) => ({ type: 'RECIEVED_USER', user: user_ })

const fetchUser = (user: any, {update}: {update: boolean}) => {
 return function (dispatch: Function) {

  if (user == null || update) {
    dispatch(getUser())
    return AuthAPI.getUser()
    .then(user_data => user_data.data)
    .then(user_ => {
      dispatch(recievedUser(user_))
    }) 
  }

 } 
}

const getInstitution = () => ({ type: 'GET_INSTITUTION' })
const recievedInstitution = (institution_: any) => ({ type: 'RECIEVED_INSTITUTION', institution: institution_ })

const fetchInstitution = (institution: any, user: any) => {

  return function (dispatch: Function) {
    if (institution == null) {

      // if we don't have the user information ...
      if (user == null) {
        dispatch(getUser())
        AuthAPI.getUser()
        .then(user_data => user_data.data)
        .then(user_ => {

          dispatch(recievedUser(user_))
          // TODO get the institution id from the user and fetch that
          // document
          // dispatch(getInstitution())

        })
      }
      else {

        // fetch the institution document with the id in the user's auth info data
        // dispatch(getInstitution())

      }

    }
  }

}

export {getUser, fetchUser}