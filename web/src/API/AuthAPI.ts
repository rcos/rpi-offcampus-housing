import API from './API'

const AuthAPI = {
  status: (): Promise<any> =>
  API.get('/auth/status'),

  getUser: (): Promise<any> => 
  API.get('/auth/user')
  // todo create getUser that returns the current
  // logged in user or null. 
}

export default AuthAPI