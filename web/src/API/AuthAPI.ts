import API from './API'

const AuthAPI = {
  status: (): Promise<any> =>
  API.get('/auth/status'),

  getUser: (): Promise<any> => 
  API.get('/auth/user'),
  
  logout: (): Promise<any> =>
  API.get('/auth/logout'),

  subscribeToPush: (user_type: "landlord" | "student", user_id: string, subscription: any): Promise<any> =>
  API.post(`/subscribe/${user_type}/${user_id}`, subscription)
}

export default AuthAPI