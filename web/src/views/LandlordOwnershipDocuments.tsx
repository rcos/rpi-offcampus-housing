import React, {useEffect} from 'react'
import {useMediaQuery} from 'react-responsive'
import {HiArrowLeft, HiPlus} from 'react-icons/hi'
import {useHistory} from 'react-router'
import {useSelector} from 'react-redux'

import CommentBubble from '../components/toolbox/misc/CommentBubble'
import {ReduxState} from '../redux/reducers/all_reducers'
import {useGetOwnershipLazyQuery, useGetPropertyLazyQuery} from '../API/queries/types/graphqlFragmentTypes'
import Button from '../components/toolbox/form/Button'
import Centered from '../components/toolbox/layout/Centered'
import {FloatingLogo} from '../components/Logo'

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

  const reviewStatus = (): 'in-review' | 'confirmed' | '' => {
    if (!ownershipData || !ownershipData.getOwnership.data) return ''
    if (ownershipData.getOwnership.data.status == `confirmed`) return 'confirmed'
    if (ownershipData.getOwnership.data.status == `in-review`) return 'in-review'
    return ''
  }

  const getCommentColor = (): string => {
    if (reviewStatus() == `in-review`) return 'yellow'
    if (reviewStatus() == `confirmed`) return 'blue'
    return 'yellow'
  }

  const getCommentMessage = (): string => {
    if (reviewStatus() == `in-review`)
      return `Ownership documents are in review. Please upload documents
      that indicate proof of ownership of this property`;
    
    if (reviewStatus() == `confirmed`)
      return `Your ownership for this property has been successfully confirmed`

    else return `Status unknown`
  }

  const isMobile = useMediaQuery({ query: '(max-width: 500px)' })
  return (<Centered width={isMobile ? 300 : 600} height={`100%`}>
    <div style={{paddingTop: '80px'}}>
      <FloatingLogo />
      {/* Button Area */}
      <div style={{marginBottom: '20px', width: '40%'}}>
      </div>
      <div className="title-1" style={{marginBottom: '20px'}}>Property Ownership</div>

      {/* Property Location */}
      {propertyData && <div className="title-0" style={{marginBottom: '20px'}}>
        {propertyData.getProperty.data ? propertyData.getProperty.data.location : '__'}
      </div>}

      {/* Status */}
      {ownershipData && 
      <CommentBubble 
        header="status"
        message={getCommentMessage ()}
        color={getCommentColor ()}
      />}

      {/* Documents Uploaded */}
      <div style={{marginBottom: '20px'}} />
      <DocumentPreviews 
        documents={ownershipData && ownershipData.getOwnership.data && ownershipData.getOwnership.data.ownership_documents ?
          ownershipData.getOwnership.data.ownership_documents
          :[]}
        pending={[]}
      />
      
    </div>
  </Centered>)
}


interface IDocumentPreviews {
  documents: any[]
  pending: any[]
}
const DocumentPreviews = ({documents, pending}: IDocumentPreviews) => {

  return (<div className={`document-previews ${documents.length == 0 ? 'empty' : ''}`}>

    {/* document count */}
    <div className="title-1" style={{
      paddingLeft: '5px',
      height: '30px',
      lineHeight: '30px'
      }}>
      {documents.length} Documents
    </div>

    {
      documents.length == 0 && pending.length == 0 &&
      <div className="empty">
        <div style={{marginBottom: '10px'}}>No documents uploaded</div>
        <div>
          <Button 
            text="Upload Document(s)"
            icon={<HiPlus />}
            iconLocation="left"
            background="#99E1D9"
          />
        </div>
      </div>
    }
  </div>)
}

export default LandlordOwnershipDocuments