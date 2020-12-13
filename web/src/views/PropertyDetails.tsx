import React, {useEffect, useState} from 'react'
import ViewWrapper from '../components/ViewWrapper'
import {useHistory} from 'react-router'
import {useSelector} from 'react-redux'
import {ReduxState} from '../redux/reducers/all_reducers'
import {PropertyDetails, Property, useGetPropertyLazyQuery} from '../API/queries/types/graphqlFragmentTypes'

const PropertyDetailsView = (
    {property_id}: {property_id: string}
) => {

    const history = useHistory()
    const user = useSelector((state: ReduxState) => state.user)
    const [GetProperty, {data: propertyResponse}] = useGetPropertyLazyQuery()
    const [property, setProperty] = useState<Property | null>(null)

    const isSet = (_: any) => _ != null && _ != undefined

    const propertyDetailsSet = (details: PropertyDetails | null | undefined): boolean => isSet(details)

    useEffect(() => {
        GetProperty({
            variables: { id: property_id, withLandlord: false, withReviews: false, reviewCount: 0, reviewOffset: 0 }
        })
    }, [])

    useEffect(() => {
        if (propertyResponse && propertyResponse.getProperty) {
            if (propertyResponse.getProperty.error || !propertyResponse.getProperty.success
            || !propertyResponse.getProperty.data) {
                console.error(`Error retrieving property`)
                history.push('/')
            }
            else {
                /**
                 * If the property details have not been set, take them to the page to
                 * set the initial details of the property.
                 */
                if (!propertyDetailsSet(propertyResponse.getProperty.data.details)) {
                    history.push(`/landlord/property/${property_id}/new`)
                }
                else {
                    setProperty(propertyResponse.getProperty.data)
                }
            }
        }
    }, [propertyResponse])

    return (<ViewWrapper>
        <React.Fragment>
            {property != null &&
                <div>Property Loaded !
                    {console.log(property)}
                </div>
            }
        </React.Fragment>
    </ViewWrapper>)
}

export default PropertyDetailsView