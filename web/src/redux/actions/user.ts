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

export {getUser, fetchUser}