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
      console.log(`SET_INSTITUTION RESUCER`)
      return action.institution
    default:
      console.log(`UNDEFIEND RESUCER`)
      return state
  }
}

export { userReducer, institutionReducer }