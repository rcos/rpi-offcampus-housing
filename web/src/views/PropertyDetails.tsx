import React, {useEffect} from 'react'
import ViewWrapper from '../components/ViewWrapper'
import {useHistory} from 'react-router'
import {useSelector} from 'react-redux'
import {ReduxState} from '../redux/reducers/all_reducers'

const PropertyDetails = (
    {property_id}: {property_id: string}
) => {

    const history = useHistory()
    const user = useSelector((state: ReduxState) => state.user)
    const propertyDetailsSet = () => false

    // if the property details are not set, redirect
    // to intial property set view
    useEffect(() => {
        if (user && user.user) {
            if (!propertyDetailsSet()) {
                history.push(`/landlord/property/${property_id}/new`)
            }
        }
    }, [user])

    return (<ViewWrapper>
        <div>
            Property Details
        </div>
    </ViewWrapper>)
}

export default PropertyDetails