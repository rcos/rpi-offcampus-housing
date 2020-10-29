import API from './API'

const StudentAPI = {

  updateInfo: (id: string, first_name: string | null, last_name: string | null, email: string | null)
  : Promise<any> => API.put(`/api/students/${id}`, {
    first_name: first_name,
    last_name: last_name,
    email: email
  })
}

export default StudentAPI