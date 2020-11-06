const userReducer = ( state: null, action: any) => {

  switch(action.type) {
    case 'GET_USER':
      return null
      
    case 'RECIEVED_USER':
      return action.user
      
  }

  return null

}

export { userReducer }