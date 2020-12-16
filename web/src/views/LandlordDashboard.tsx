import React, {useEffect, useState} from 'react'
import ViewWrapper from '../components/ViewWrapper'
import Button from '../components/toolbox/form/Button'
import {Ownership, 
  Property, 
  useGetOwnershipsForLandlordLazyQuery,
  useResendEmailConfirmationLazyQuery
} from '../API/queries/types/graphqlFragmentTypes'
import {useSelector} from 'react-redux'
import {ReduxState} from '../redux/reducers/all_reducers'
import {useNumberCounter} from '../components/hooks/useNumberCounter';
import RectMouseTransform from '../components/toolbox/misc/RectMouseMagnet'
import CollapsableTab from '../components/toolbox/misc/CollapsableTab'
import NoEnties from '../components/toolbox/misc/NoEnties'
import {useHistory} from 'react-router'
import {Link} from 'react-router-dom'
import Popup, {PopupHeader} from '../components/toolbox/misc/Popup'
import {HiCheckCircle} from 'react-icons/hi'
import Cookies from 'universal-cookie'

const LandlordDashboard = () => {

  const cookies = new Cookies()
  const history = useHistory()
  const [showResendConfirmation, setShowResendConfirmation] = useState<boolean>(false)
  const [resendConfirmState, setResendConfirmState] = useState<number>(0)
  const user = useSelector((state: ReduxState) => state.user)

  const [ResendEmailConfirmation, {data: resendConfirmResponse}] = useResendEmailConfirmationLazyQuery()
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

  useEffect(() => {
    if (resendConfirmResponse && resendConfirmResponse.resendEamilConfirmation
      && resendConfirmResponse.resendEamilConfirmation.success) {
        cookies.set('conf_em_last_res', new Date().getTime())
      }
  }, [resendConfirmResponse])

  const propertiesCounter = useNumberCounter({
    value: propertyOwnerships.length,
    duration: 800
  })

  const inReviewCounter = useNumberCounter({
    value: propertyOwnershipsInReview.length,
    duration: 800
  })

  const emailConfirmed = ():boolean => {
    if (!user || !user.user) return false;
    return !Object.prototype.hasOwnProperty.call(user.user, `confirmation_key`) || (user.user as any).confirmation_key == undefined
  }


  const resendEmail = () => {
    let last_confirm_email_resent = cookies.get('conf_em_last_res')
    if (last_confirm_email_resent) {
      let last_requested: Date = new Date(parseInt(last_confirm_email_resent))
      let min_required_date = new Date(
        last_requested.getTime()
        + (1000 * 60 * 60 * 24)
      )

      if (new Date().getTime() > min_required_date.getTime()) {
        // allow them
        ResendEmailConfirmation({
          variables: {
            landlord_id: user && user.user ? user.user._id : `undefined`
          }
        })
      }
    }

    // if no cookie is set, then send the request
    else {
      ResendEmailConfirmation({
        variables: {
          landlord_id: user && user.user ? user.user._id : `undefined`
        }
      })
    }
    setResendConfirmState(1)
    setTimeout(() => {
      setShowResendConfirmation(false)
    }, 1000)
    setTimeout(() => {
      setResendConfirmState(0)
    }, 1500)
  }

  return (<ViewWrapper
    left_attachment_width={200}
    left_attachment={<div className="getting-started-attachment">

      {/* Resent Confirm-Email Popup */}
      <Popup show={showResendConfirmation} width={400} height={90}>
        <div>
          <PopupHeader 
            withClose={true}
            onClose={() => {setShowResendConfirmation(false); setResendConfirmState(0);}}
          >Resend Email Confirmation</PopupHeader>
          {resendConfirmState == 0 && <div style={{
              display: 'flex',
              padding: `10px 10px`
            }}>
            <div style={{flexGrow: 1, marginRight: `10px`}}>
              <div className="disabled-input">
                {user && user.user ? user.user.email : `no email found`}
              </div>
            </div>
            <div style={{width: `100px`, minWidth: `100px`}}>
              <Button 
                onClick={() => resendEmail()}
                textColor="white"
                text="Resend"
                background="#6AD68B"
              />
            </div>
          </div>}
          {resendConfirmState == 1 && 
          <div className="success-submit"
            style={{
              padding: `10px 5px`
            }}
          >
        <div className="icon-area"><HiCheckCircle /></div><div className="text-area">
          Confirmation email resent!
        </div>
        </div>}
        </div>
      </Popup>
      
      <div className="section-header-3" style={{padding: `0 10px`}}>
        <div className="title-area">Getting Started</div>
      </div>

      {/* List of Tasks */}
      <div className="list-style-3">

        <div 
          onClick={() => {if (!emailConfirmed()) setShowResendConfirmation(true)}}
          className={`task-item ${emailConfirmed() ? `strike-through` : ``}`}>
          <div className="list-item-number">1</div>
          <div className="list-item-value">Confirm Your Email</div>
        </div>
        <div className="task-item">
          <div className="list-item-number">2</div>
          <div className="list-item-value">Add Phone Number</div>
        </div>
        <div className="task-item">
          <div className="list-item-number">3</div>
          <div className="list-item-value">Add a Property</div>
        </div>
        <div className="task-item">
          <div className="list-item-number">4</div>
          <div className="list-item-value">Add Details</div>
        </div>
        <div className="task-item">
          <div className="list-item-number">5</div>
          <div className="list-item-value">Open a Lease</div>
        </div>

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

interface DashboardSidebarProps {
  propertyOwnerships?: Ownership[]
  propertyOwnershipsInReview?: Ownership[]
  landlord_id: string | null
}
export const DashboardSidebar = ({
  propertyOwnerships: propertyOwnerships_,
  propertyOwnershipsInReview: propertyOwnershipsInReview_,
  landlord_id
}: DashboardSidebarProps) => {

  const [GetOwnerships, {data: ownershipsResponse}] = useGetOwnershipsForLandlordLazyQuery()
  const [ownerships, setOwnerships] = useState<Ownership[]>([])
  const [ownershipsInReview, setOwnershipsInReview] = useState<Ownership[]>([])

  useEffect(() => {
    if (landlord_id != null) {
      if (!propertyOwnerships_ || !propertyOwnershipsInReview_) {
        GetOwnerships({
          variables: {
            landlord_id,
            with_properties: true
          }
        })
      }
    }
  }, [landlord_id])

  useEffect(() => {
    if (ownershipsResponse && ownershipsResponse.getOwnershipsForLandlord && ownershipsResponse.getOwnershipsForLandlord.data) {
      let ownerships_: Ownership[] = ownershipsResponse.getOwnershipsForLandlord.data.ownerships;
      setOwnerships(
        ownerships_.filter((ownership_: Ownership) => ownership_.status == 'confirmed')
      )
      setOwnershipsInReview(
        ownerships_.filter((ownership_: Ownership) => ownership_.status == 'in-review')
      )
    }
  }, [ownershipsResponse])

  const getOwnerships = (): Ownership[] => {
    if (propertyOwnerships_) return propertyOwnerships_;
    return ownerships;
  }

  const getOwnershipsInReview = (): Ownership[] => {
    if (propertyOwnershipsInReview_) return propertyOwnershipsInReview_;
    return ownershipsInReview;
  }

  return (<div style={{marginTop: `50px`}}>
  <CollapsableTab counter_on_end={true} collapsed={true} tab_name="Properties" count={getOwnerships().length}>
    <div className="list-style-4">
      {getOwnerships().map((ownership: Ownership, i: number) => 
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
  {getOwnershipsInReview().length > 0 &&
  <CollapsableTab counter_on_end={true} tab_name="In-Review" count={getOwnershipsInReview().length}>
    <div className="list-style-4">
      {getOwnershipsInReview().map((ownership: Ownership, i: number) => 
      <Link to={`/landlord/ownership-documents/${ownership._id}`} key={i}>
        <div className="list-item">
          <div className="primary">{ownership.property_doc ? ownership.property_doc.address_line : ''}</div>
        </div>
      </Link>)}
    </div>
  </CollapsableTab>}
</div>)
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const dateToStr = (d_: Date): string => `${MONTHS[d_.getMonth()]} ${d_.getDate()}, ${d_.getFullYear()}`

export default LandlordDashboard