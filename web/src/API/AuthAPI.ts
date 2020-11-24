import API from './API'

const AuthAPI = {
  status: (): Promise<any> =>
  API.get('/auth/status'),

  getUser: (): Promise<any> => 
  API.get('/auth/user'),
  
  logout: (): Promise<any> =>
  API.get('/auth/logout')
}

export default AuthAPI