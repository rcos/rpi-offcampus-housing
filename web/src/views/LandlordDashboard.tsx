import React, {useEffect, useState} from 'react'
import ViewWrapper from '../components/ViewWrapper'
import Button from '../components/toolbox/form/Button'
import {Ownership, Property} from '../API/queries/types/graphqlFragmentTypes'
import {useSelector} from 'react-redux'
import {ReduxState} from '../redux/reducers/all_reducers'
import {useNumberCounter} from '../components/hooks/useNumberCounter';
import RectMouseTransform from '../components/toolbox/misc/RectMouseMagnet'
import CollapsableTab from '../components/toolbox/misc/CollapsableTab'
import NoEnties from '../components/toolbox/misc/NoEnties'
import {useGetOwnershipsForLandlordLazyQuery} from '../API/queries/types/graphqlFragmentTypes'
import {useHistory} from 'react-router'
import {Link} from 'react-router-dom'


const LandlordDashboard = () => {

  const history = useHistory()
  const user = useSelector((state: ReduxState) => state.user)
  const [GetOwnershipsForLandlord, {data: ownershipsResponse}] = useGetOwnershipsForLandlordLazyQuery()
  const [propertyOwnerships, setProperyOwnerships] = useState<Ownership[]>([])
  const [propertyOwnershipsInReview, setProperyOwnershipsInReview] = useState<Ownership[]>([])

  useEffect(() => {
    if (user && user.user && user.type == 'landlord') {
      GetOwnershipsForLandlord({
        variables: {
          landlord_id: user.user._id,
          with_properties: true
        }
      })
    }
  }, [user])

  useEffect(() => {
    if (ownershipsResponse && ownershipsResponse.getOwnershipsForLandlord && ownershipsResponse.getOwnershipsForLandlord.data) {
      let ownerships_: Ownership[] = ownershipsResponse.getOwnershipsForLandlord.data.ownerships;
      setProperyOwnerships(
        ownerships_.filter((ownership_: Ownership) => ownership_.status == 'confirmed')
      )
      setProperyOwnershipsInReview(
        ownerships_.filter((ownership_: Ownership) => ownership_.status == 'in-review')
      )
    }
  }, [ownershipsResponse])

  const propertiesCounter = useNumberCounter({
    value: propertyOwnerships.length,
    duration: 800
  })

  const inReviewCounter = useNumberCounter({
    value: propertyOwnershipsInReview.length,
    duration: 800
  })

  return (<ViewWrapper
    left_attachment_width={200}
    left_attachment={<div className="getting-started-attachment">
      
      <div className="section-header-3" style={{padding: `0 10px`}}>
        <div className="title-area">Getting Started</div>
      </div>

      {/* List of Tasks */}
      <div className="list-style-3">
        {[
          "Confirm Your Email",
          "Add Phone Number",
          "Add a Property",
          "Add Details",
          "Open a Lease"
        ].map((task_: string, i: number) => 
        <div className="task-item" key={i}>
          <div className="list-item-number">{i + 1}</div>
          <div className="list-item-value">{task_}</div>
        </div>)}
      </div>

    </div>}

    sidebar_content={
      <div style={{marginTop: `50px`}}>
        <CollapsableTab counter_on_end={true} collapsed={true} tab_name="Properties" count={propertyOwnerships.length}>
          <div className="list-style-4">
            {propertyOwnerships.map((ownership: Ownership, i: number) => 
            <Link key={i} to={`/landlord/property/${ownership.property_doc ? ownership.property_doc._id: '_'}`}>
              <div className="list-item">
                <div className="primary">{ownership.property_doc ? ownership.property_doc.address_line : ''}</div>
              </div>
            </Link>)}
          </div>
        </CollapsableTab>
        <CollapsableTab counter_on_end={true} collapsed={true} tab_name="Leases" count={0}>
          <div/>
        </CollapsableTab>
        {propertyOwnershipsInReview.length > 0 &&
        <CollapsableTab counter_on_end={true} tab_name="In-Review" count={propertyOwnershipsInReview.length}>
          <div className="list-style-4">
            {propertyOwnershipsInReview.map((ownership: Ownership, i: number) => 
            <Link to={`/landlord/ownership-documents/${ownership._id}`} key={i}>
              <div className="list-item">
                <div className="primary">{ownership.property_doc ? ownership.property_doc.address_line : ''}</div>
              </div>
            </Link>)}
          </div>
        </CollapsableTab>}
      </div>
    }
  >
    <div>

      {/* Properties Section */}
      <div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end'
        }}>
          <div className="section-header-2" style={{flexGrow: 1}}>
            <div className="title-area">Properties</div>
            <div className="counter_">{propertiesCounter} {propertyOwnerships.length == 1 ? 'property' : 'properties'}</div>
          </div>

          <div>
            <Button 
              text="Add Property"
              link_to="/landlord/new-property"
              background="#3B4353"
              textColor="white"
            />
          </div>
        </div>

        {/* Property Map */}
        <div className="property-preview-container">
          {propertyOwnerships.length > 0 && propertyOwnerships.map((property: Ownership, i: number) => 
          <PropertyItem 
            key={i}
            property={property.property_doc!}
          />)}
          {propertyOwnerships.length == 0 && 
          <NoEnties message="No properties on record" />}
        </div>
      </div>

      {/* In-Review Section */}
      {propertyOwnershipsInReview.length > 0 && <div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end'
        }}>
          <div className="section-header-2" style={{flexGrow: 1}}>
            <div className="title-area">In-Review</div>
            <div className="counter_">{inReviewCounter} {propertyOwnershipsInReview.length == 1 ? 'property' : 'properties'} in review</div>
          </div>
        </div>

        <div className="text-on-bg">
        Our moderation team is going over your property information. You will be informed once the review is complete.
        </div>

        {/* In-Review List Items */}
        {propertyOwnershipsInReview.length > 0 && propertyOwnershipsInReview.map((ownership: Ownership, i: number) => 
          <ReviewListItem key={i} ownership={ownership} />
        )}

      </div>}

    </div>
  </ViewWrapper>)
}

const PropertyItem = ({property}: {property: Property}) => {

  return (<Link to={`/landlord/property/${property._id}`}><div className="property-preview">
    
    <RectMouseTransform
      rotateXStrength={2.5}
      rotateYStrength={1.5}
      shadowStrength={0.1}
    ><div className="image-area" /></RectMouseTransform>
    <div className="address-line">{property.address_line} {property.address_line_2}</div>
    <div className="sub-address-line">{property.city} {property.state}, {property.zip}</div>

  </div></Link>)
}

const ReviewListItem = ({ownership}: {ownership: Ownership}) => {

  return (<Link to={`/landlord/ownership-documents/${ownership._id}`}>
    <div className="list-style-2">
      <div className="primary">{ownership.property_doc!.address_line} {ownership.property_doc!.address_line_2}</div>
      <div className="secondary">{ownership.property_doc!.city} {ownership.property_doc!.state}, {ownership.property_doc!.zip}</div>
      <div className="secondary">Submitted {dateToStr(new Date(ownership.date_submitted))}</div>
    </div>
  </Link>)
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const dateToStr = (d_: Date): string => `${MONTHS[d_.getMonth()]} ${d_.getDate()}, ${d_.getFullYear()}`

export default LandlordDashboard