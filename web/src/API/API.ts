import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:9010',
  withCredentials: true
})

export default API