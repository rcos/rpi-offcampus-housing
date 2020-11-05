import API from './API'

const SearchAPI = {

  properties: (limit: number, offset: number): Promise<any> => 
  API.get(`/api/search/properties/${offset}/${limit}`)
  
}

export default SearchAPI