const userReducer = ( state: null, action: any) => {

  switch(action.type) {
    case 'GET_USER':
      return null
      
    case 'RECIEVED_USER':
      return action.user
      
  }

  return null

}

const institutionReducer = (state: null, action: any) => {
  switch(action.type) {
    case 'GET_INSTITUTION':
      return null
    case 'RECIEVED_INSTITUTION':
      return action.institution
  }
  return null
}

export { userReducer, institutionReducer }