import React, {useEffect, useRef, useState} from 'react'
import { BiHome, BiPlus } from 'react-icons/bi'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { FiEdit2 } from 'react-icons/fi'
import {useHistory} from 'react-router'
import { motion, useSpring, useTransform } from 'framer-motion'
import ViewWrapper from '../components/ViewWrapper'
import {HiOutlineHome, HiSearch, HiPlus} from 'react-icons/hi'
import Input from '../components/toolbox/form/Input'
import Button from '../components/toolbox/form/Button'
import Pagination from '../components/toolbox/layout/Pagination'
import ContextMenu from '../components/toolbox/misc/ContextMenu'
import {Ownership, Property, useGetOwnershipsForLandlordLazyQuery} from '../API/queries/types/graphqlFragmentTypes'
import {useSelector} from 'react-redux'
import {ReduxState} from '../redux/reducers/all_reducers'
import {useNumberCounter} from '../components/hooks/useNumberCounter';
import RectMouseTransform from '../components/toolbox/misc/RectMouseMagnet'
import CollapsableTab from '../components/toolbox/misc/CollapsableTab'

const LandlordDashboard = () => {

  const propertiesCounter = useNumberCounter({
    value: 8,
    duration: 800
  })

  const inReviewCounter = useNumberCounter({
    value: 2,
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
        <CollapsableTab counter_on_end={true} collapsed={true} tab_name="Properties" count={8}>
          <div className="list-style-4">
            {Array.from(new Array(8), (_: any, i: number) => 
            <div className="list-item" key={i}>
              <div className="primary">1902 South 20th Ave</div>
            </div>)}
          </div>
        </CollapsableTab>
        <CollapsableTab counter_on_end={true} collapsed={true} tab_name="Leases" count={3}>
          <div className="list-style-4">
            {Array.from(new Array(3), (_: any, i: number) => 
            <div className="list-item" key={i}>
              <div className="primary">1902 South 20th Ave</div>
            </div>)}
          </div>
        </CollapsableTab>
        <CollapsableTab counter_on_end={true} tab_name="In-Review" count={2}>
          <div className="list-style-4">
            {Array.from(new Array(2), (_: any, i: number) => 
            <div className="list-item" key={i}>
              <div className="primary">1902 South 20th Ave</div>
            </div>)}
          </div>
        </CollapsableTab>
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
            <div className="counter_">{propertiesCounter} forms</div>
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
          {Array.from(new Array(8), (_: any, i: number) => 
          <PropertyItem 
            key={i}
          />)}
        </div>
      </div>

      {/* In-Review Section */}
      <div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end'
        }}>
          <div className="section-header-2" style={{flexGrow: 1}}>
            <div className="title-area">In-Review</div>
            <div className="counter_">{inReviewCounter} properties in review</div>
          </div>
        </div>

        <div className="text-on-bg">
        Our moderation team is going over your property information. You will be informed once the review is complete.
        </div>

        {/* In-Review List Items */}
        {Array.from(new Array(2), (_: any, i: number) => 
          <ReviewListItem key={i} />
        )}

      </div>

    </div>
  </ViewWrapper>)
}

const PropertyItem = () => {

  return (<div className="property-preview">
    
    <RectMouseTransform
      rotateXStrength={2.5}
      rotateYStrength={1.5}
      shadowStrength={0.1}
    ><div className="image-area" /></RectMouseTransform>
    <div className="address-line">1902 South 20th Ave</div>
    <div className="sub-address-line">Troy NY, 12180</div>

  </div>)
}

const ReviewListItem = () => {

  return (<div className="list-style-2">
    <div className="primary">1902 South 20th Ave</div>
    <div className="secondary">Troy NY, 12180</div>
    <div className="secondary">Submitted December 10th, 2021</div>
  </div>)
}

export default LandlordDashboard