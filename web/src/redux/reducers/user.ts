import AuthAPI from '../../API/AuthAPI'

const userReducer = async (state = null, action: any) => {

  switch(action.type) {
    case 'GET_USER':
      if (state == null) {
        // fetch the user if they are not yet saved
        let user_ = await AuthAPI.getUser()
        return user_
      }
    break;
  }

  return null

}

export { userReducer }