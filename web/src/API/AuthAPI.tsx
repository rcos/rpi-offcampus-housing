import API from './API'

const AuthAPI = {
  status: (): Promise<any> =>
  API.get('/auth/status')
}

export default AuthAPI