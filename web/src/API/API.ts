import axios from 'axios'
import {backendPath} from '../config'

const API = axios.create({
  baseURL: backendPath(''),
  withCredentials: true
})

export default API
