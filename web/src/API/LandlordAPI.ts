import API from './API'

const LandlordAPI = {
  createLandlord: (
    first_name: string,
    last_name: string,
    email: string,
    password: string
  ): Promise<any> => API.put('/api/landlords', {
    first_name: first_name,
    last_name: last_name,
    email: email,
    password: password
  }),

  login: (email: string, password: string): Promise<any> => API.post('/auth/local-auth', {
    email: email, password: password
  })
}

export default LandlordAPI