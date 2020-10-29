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
  }

  return null

}

export { userReducer }