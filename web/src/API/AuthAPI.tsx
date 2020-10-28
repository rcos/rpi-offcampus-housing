import API from './API'

const AuthAPI = {
  status: (): Promise<any> =>
  API.get('/auth/status'),

  getUser: (): Promise<any> => 
  new Promise ((resolve, reject) => resolve(false)) 
  // todo create getUser that returns the current
  // logged in user or null. 
}

export default AuthAPI