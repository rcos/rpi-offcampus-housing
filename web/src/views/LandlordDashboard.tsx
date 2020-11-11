import React, {useEffect, useRef, useState} from 'react'
import { BiHome, BiPlus } from 'react-icons/bi'
import { motion, useSpring, useTransform } from 'framer-motion'
import LandlordViewWrapper from '../components/LandlordViewWrapper'
import Button from '../components/toolbox/form/Button'
import Pagination from '../components/toolbox/layout/Pagination'

const LandlordDashboard = () => {

  const [focusedProperty, setFocusedProperty] = useState<Object | null>({placeholder: true})//(null)

  const propertyFocusSpring = useSpring(0, {stiffness: 80})
  const propertyFocusWidthTransform = useTransform(propertyFocusSpring, (x: number) => {
    return `${x * 50}%`
  })

  const propertyShowSpring = useSpring(0)
  const propertyShowOpacityTransform = useTransform(propertyShowSpring, [0, 1], [0, 1])

  useEffect(() => {

    const unsubPropertyFocusSpring = propertyFocusSpring.onChange((x: number) => {
      if (x == 1) {
        propertyShowSpring.set(1)
      }
    })

    const unsubPropertyShowSpring = propertyShowSpring.onChange((x: number) => {
      if (x == 0) {
        propertyFocusSpring.set(0)
      }
    })

    return () => {
      unsubPropertyFocusSpring()
      unsubPropertyShowSpring()
    }
  }, [])

  useEffect(() => {

    if (focusedProperty == null) {
      propertyShowSpring.set(0)
    }
    else {
      propertyFocusSpring.set(1)
    }

  }, [focusedProperty])

  ////////////////////////////////////////////

  const focusProperty = () => {
    setFocusedProperty(focusedProperty == null ? {placeholder: true} : null)
  }

  return (<LandlordViewWrapper>
    <div style={{
      display: 'flex'
    }}>
      
      <div style={{flexGrow: 1}}>
        <MainDashboardArea 
          focusProperty={focusProperty}
        />
      </div>
      <motion.div style={{
        width: propertyFocusWidthTransform,
        opacity: propertyShowOpacityTransform
      }}><LandlordPropertyOverview /></motion.div>

    </div>
  </LandlordViewWrapper>)
}

interface IMainDashboardArea {
  focusProperty: (property_id: number) => void
}
const MainDashboardArea = ({ focusProperty }: IMainDashboardArea) => {

  const headerContainerRef = useRef<HTMLDivElement>(null)
  const propertyContainerRef = useRef<HTMLDivElement>(null)

  // mount
  useEffect(() => {

    const setContainerHeight = (height: number) => {
      if (propertyContainerRef.current == null) return;
      propertyContainerRef.current.style.height = `${height}px`
    }

    const initialHeight = () => {
      if (headerContainerRef.current == null) return;
      setContainerHeight ( document.documentElement.clientHeight - headerContainerRef.current.getBoundingClientRect().bottom - 50 )
    }

    initialHeight()
    let a_t = setTimeout(() => initialHeight(), 50)
    let b_t = setTimeout(() => initialHeight(), 100)
    let c_t = setTimeout(() => initialHeight(), 500)
    let d_t = setTimeout(() => initialHeight(), 1000)

    const resizeContainer = () => {
      if (headerContainerRef.current == null) return;

      setContainerHeight ( document.documentElement.clientHeight - headerContainerRef.current.getBoundingClientRect().bottom - 50 )
    }
    
    window.addEventListener('resize', resizeContainer)
    // unmount
    return () => {
      window.removeEventListener('resize', resizeContainer)
      clearInterval(a_t)
      clearInterval(b_t)
      clearInterval(c_t)
      clearInterval(d_t)
    }
  }, [])

  return (<div className="landlord-main-dashboard-area">

    {/* Header */}
    <div style={{display: 'flex'}} ref={headerContainerRef}>
      <div style={{
        flexGrow: 1
      }} className="left-and-right pointer activable active section-header-2">
        <div className="icon-area"><BiHome /></div>
        <div className="title-area">10 PROPERTIES</div>
      </div>
      <div>
        <Button 
          text="Add Property"
          background="#99E1D9"
          icon={<BiPlus />}
          iconLocation="right"
        />
      </div>
    </div>

    {/* Body */}
    <div className="property-list padded upper"  style={{ overflowY: 'scroll'}} ref={propertyContainerRef}>
      {Array.from(new Array(10), (x: any, i: number) => (<div>
        <PropertyEntry focusProperty={focusProperty} />
      </div>))}
    </div>

    <div className="pagination">
      <Pagination 
        page={0}
        page_range={{min: 0, max: 5}}
        pageChange={() => {}}
      />
    </div>

  </div>)
}

interface IPropertyEntry {
  focusProperty: Function
}

const PropertyEntry = ({focusProperty}: IPropertyEntry) => {

  return (<div className="landlord-property-entry">

    {/* Image Area */}
    <div className="image-area">
      <div className="img-holder"></div>
    </div>

    {/* Description Area */}
    <div className="desc-area">

      <div style={{
        fontWeight: 600,
        fontSize: `0.9rem`
      }}>101 Sample Address Location</div>

      <div className="kv-pair">
        <div className="key">Bedrooms</div>
        <div className="value">3</div>
      </div>

      <div className="kv-pair">
        <div className="key">Reviews</div>
        <div className="value">20</div>
      </div>
    </div>

    {/* Action Area */}
    <div className="action-area">
      <Button 
        text="Edit"
        background="#E4E4E4"
      />
      <Button 
        text="View"
        background="#E4E4E4"
        onClick={() => focusProperty(0)}
      />
    </div>
  </div>)
}

const LandlordPropertyOverview = () => {

  return (<div className="landlord-property-overview">

    {/* Header */}
    <div className="header" style={{fontWeight: 600, letterSpacing: `1px`}}>101 Sample Address Location</div>
  </div>)
}

export default LandlordDashboard