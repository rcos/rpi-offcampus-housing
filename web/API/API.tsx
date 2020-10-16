import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:9010'
})

export default API