import Property from '../views/Property'
import API from './API'

const PropertyAPI = {

  property: (property_id: string): Promise<any> => API.get(`/api/properties/${property_id}`),
  landlord: (property_id: string): Promise<any> => API.get(`/api/properties/${property_id}/landlord`),
  reviews:  (property_id: string): Promise<any> => API.get(`/api/properties/${property_id}/reviews`)
}

export default PropertyAPI