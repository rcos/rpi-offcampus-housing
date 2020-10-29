import AuthAPI from '../../API/AuthAPI'

const userReducer = async (
  state: Promise<any> = new Promise((resolve, reject) => { resolve(null) }), 
  action: any) => {

  switch(action.type) {
    case 'GET_USER':

      let state_val = await state.then(val => val)

      if (state_val == null) {
        // fetch the user if they are not yet saved
        let user_ = await AuthAPI.getUser()
        return user_.data
      }
    break;
    case 'UPDATE_USER':
      /* UPDATE_USER: User data should be fetched
         regardless of the current state of the user.
         This should be used when modifications to the user
         have bene made and its state needs to be updated
      */
      let user_ = await AuthAPI.getUser()
      return user_.data
    break;
  }

  return null

}

export { userReducer }