const userReducer = (state = null, action: any) => {

  switch(action.type) {
    case 'GET_USER':
      return null
      
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