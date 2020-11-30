import React, {useEffect, useRef, useState} from 'react'
import { BiHome, BiPlus } from 'react-icons/bi'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { FiEdit2 } from 'react-icons/fi'
import {useHistory} from 'react-router'
import { motion, useSpring, useTransform } from 'framer-motion'
import LandlordViewWrapper from '../components/LandlordViewWrapper'
import {HiOutlineHome, HiSearch, HiPlus} from 'react-icons/hi'
import Input from '../components/toolbox/form/Input'
import Button from '../components/toolbox/form/Button'
import Pagination from '../components/toolbox/layout/Pagination'
import ContextMenu from '../components/toolbox/misc/ContextMenu'
import {Ownership, Property, useGetOwnershipsForLandlordLazyQuery} from '../API/queries/types/graphqlFragmentTypes'
import {useSelector} from 'react-redux'
import {ReduxState} from '../redux/reducers/all_reducers'

type OwnedProperty = Property & {
  status: string
  ownership_id: string
}

const LandlordDashboard = () => {
  
  const history = useHistory()
  const [showInReview, setShowInReview] = useState<boolean>(true)
  const user = useSelector((state: ReduxState) => state.user)
  const [properties, setProperties] = useState<OwnedProperty[]>([])
  const [GetOwnerships, {data: ownershipDataResponse}] = useGetOwnershipsForLandlordLazyQuery()

  useEffect(() => {
    if (user && user.user && user.type == "landlord") {
      GetOwnerships({
        variables: {
          landlord_id: user.user._id
        }
      })
    }
  }, [user])

  useEffect(() => {
    if (ownershipDataResponse && ownershipDataResponse.getOwnershipsForLandlord
      && ownershipDataResponse.getOwnershipsForLandlord.data && ownershipDataResponse.getOwnershipsForLandlord.data.ownerships) {
        setProperties(
          (ownershipDataResponse.getOwnershipsForLandlord.data.ownerships
          .map((ownership: Ownership) => ownership.property_doc ? {
            ...ownership.property_doc,
            status: ownership.status,
            ownership_id: ownership._id
          } : undefined)
          .filter( (property_doc: OwnedProperty | undefined): boolean => property_doc != undefined )) as OwnedProperty[]
        )
      }
  }, [ownershipDataResponse])

  useEffect(() => {

    const setContainerHeight = () => {
      if (containerRef.current) {
        let bound_ = containerRef.current.getBoundingClientRect();
        let client_height = document.documentElement.clientHeight;

        containerRef.current.style.height = `${client_height - bound_.top - 20}px`;
      }
    }

    setContainerHeight()
    let a_ = setTimeout(() => {setContainerHeight()}, 50)
    let b_ = setTimeout(() => {setContainerHeight()}, 100)
    let c_ = setTimeout(() => {setContainerHeight()}, 500)

    window.addEventListener('resize', setContainerHeight)
    return () => {
      clearTimeout(a_)
      clearTimeout(b_)
      clearTimeout(c_)
      window.removeEventListener('resize', setContainerHeight)
    }
  }, [])

  const containerRef = useRef<HTMLDivElement>(null)
  
  const ownedProperties = (): OwnedProperty[] => {
    return properties.filter((property_: OwnedProperty) => property_.status == 'complete');
  }

  const inReviewProperties = (): OwnedProperty[] => {
    return properties.filter((property_: OwnedProperty) => property_.status == 'in-review');
  }

  return (<LandlordViewWrapper>
    <div>

      <div className="section-header left-and-right">
        <div className="icon-area"><HiOutlineHome /></div>
        <div className="title-area">Your Properties</div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        border: '1px solid rgba(0, 0, 0, 0.3)',
        alignItems: 'center'
      }}>
        
        <div className="section-header" style={{
          display: 'flex',
          marginLeft: '10px'
        }}>
          <div className="icon-area"><HiSearch /></div>
          <div className="title-area"
            style={{
              borderLeft: '1px solid rgba(0, 0, 0, 0.3)',
              borderRight: '1px solid rgba(0, 0, 0, 0.3)'
            }}
          ><input className="input-incognito" /></div>
        </div>

        <div style={{marginRight: '2px'}}>
          <Button 
            icon={<HiPlus />}
            iconLocation="right"
            text="Add Property"
            background="#99E1D9"
            onClick={() => {
              history.push('/landlord/new-property')
            }}
          />
        </div>
      </div>

      <div ref={containerRef} style={{
        overflowY: 'scroll',
        display: 'flex',
        flexDirection: 'column'
      }}>

        <div style={{
          flexGrow: 1,
          borderBottom: '1px solid rgba(0, 0, 0, 0.3)',
          overflowY: 'scroll'}}>
          {/* Owned Properties Area */}
          {ownedProperties().length == 0 && <div className="results-container">
            <div className="no-contents">
              <div></div>
              No Properties
            </div>
          </div>}
          {ownedProperties().length > 0 && <div className="results-container">
            <div className="contents">
              {ownedProperties().map((property: OwnedProperty, index: number) => {
                return (<div key={index} className="property-list-entry" onClick={() => {
                  history.push(`/landlord/ownership-documents/${property.ownership_id}`)
                }}>
                  <div className="address-area">{property.location}</div>
                  <div className="city-area">Troy</div>
                  <div className="state-area">NY</div>
                  <div className="info-area">3 Rooms / 2 Bedrooms</div>
                </div>)
              })}
            </div>    
          </div>}
        </div>

        <div>
          <div className="light-label-div">
            In Review
            <div 
              className="link"
              style={{
                display: 'inline-block',
                float: 'right'
              }}
              onClick={() => {setShowInReview(!showInReview)}}>{showInReview ? 'hide' : 'show'}</div>
          </div>
          {/* In Review Properties Area */}
          {showInReview && <div>{inReviewProperties().length == 0 && <div className="results-container">
            <div className="no-contents">
              <div></div>
              No Properties In Review
            </div>
          </div>}
          {inReviewProperties().length > 0 && <div className="results-container">
            <div className="contents">
              {inReviewProperties().map((property: OwnedProperty, index: number) => {
                return (<div key={index} 
                  onClick={() => {
                    history.push(`/landlord/ownership-documents/${property.ownership_id}`)
                  }}
                  className="property-list-entry">
                  <div className="address-area">{property.location}</div>
                  <div className="city-area">Troy</div>
                  <div className="state-area">NY</div>
                  <div className="info-area">3 Rooms / 2 Bedrooms</div>
                </div>)
              })}
            </div>    
          </div>}</div>}
        </div>

      </div>

    </div>
  </LandlordViewWrapper>)
}

export default LandlordDashboard