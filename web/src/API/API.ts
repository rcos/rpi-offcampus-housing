import axios from 'axios'
import {backendPath} from '../config'

const API = axios.create({
  baseURL: backendPath(''),
  withCredentials: true
})

const GQLQueries = {
  
  // getStudent: async ({_id}: {_id: string}): Promise<any> => API.post(`/graphql`)
}

const GQLMutators = {

}

export const GQL = {Queries: GQLQueries, Mutators: GQLMutators}
export default API
