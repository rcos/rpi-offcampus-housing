import React, {useEffect} from 'react'
import {useMediaQuery} from 'react-responsive'
import {HiArrowLeft} from 'react-icons/hi'
import {useHistory} from 'react-router'
import {useSelector} from 'react-redux'

import {ReduxState} from '../redux/reducers/all_reducers'
import {useGetOwnershipLazyQuery, useGetPropertyLazyQuery} from '../API/queries/types/graphqlFragmentTypes'
import Button from '../components/toolbox/form/Button'
import Centered from '../components/toolbox/layout/Centered'

interface ILandlordOwnershipDocuments {
  ownership_id: string
}

const LandlordOwnershipDocuments = ({ownership_id}:ILandlordOwnershipDocuments) => {

  const history = useHistory()
  const user = useSelector((state: ReduxState) => state.user)
  const [getOwnership, {data: ownershipData}] = useGetOwnershipLazyQuery()
  const [getProperty, {data: propertyData}] = useGetPropertyLazyQuery()

  useEffect(() => {
    
    getOwnership({variables: { ownership_id: ownership_id }})
  }, [ownership_id])

  useEffect(() => {
    if (ownershipData && user) {
      if (user.type == "student") history.push('/')

      // check if the currently logged in user owns the data
      if (user.type == "landlord") {

        if (ownershipData.getOwnership.success) {
          if (user.user && user.user._id == ownershipData.getOwnership.data!.landlord_id) {
            // ...
            getProperty({
              variables: {
                id: `${ownershipData.getOwnership.data!.property_id}`,
                withLandlord: false,
                withReviews: false,
                reviewOffset: 0,
                reviewCount: 0
              }
            })
          }
          else {
            console.error(`User is not authorized to see another landlord's ownership information`)
            // history.push('/landlord/dashboard')
          }
        }
        // an error occurred on server
        else {
          console.error(`An error occurred retrieving ownership information`)
          history.push('/landlord/dashboard')
        }
      }

    }  
  }, [ownershipData, user])

  const isMobile = useMediaQuery({ query: '(max-width: 500px)' })
  return (<Centered width={isMobile ? 300 : 400} height={`100%`}>
    <div style={{paddingTop: '80px'}}>
      {/* Button Area */}
      <div style={{marginBottom: '20px', width: '40%'}}>
        <Button 
          onClick={() => {
            history.push('/landlord/dashboard')
          }}
          text="Home"
          icon={<HiArrowLeft />}
          iconLocation="left"
          background="#E4E4E4"
        />
      </div>
      <div className="title-1" style={{marginBottom: '20px'}}>Property Ownership</div>
      {propertyData && <div className="title-0" style={{marginBottom: '20px'}}>
        {propertyData.getProperty.data ? propertyData.getProperty.data.location : '__'}
      </div>}
      
    </div>
  </Centered>)
}

export default LandlordOwnershipDocuments