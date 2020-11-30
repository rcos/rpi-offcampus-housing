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

const LandlordDashboard = () => {

  const [properties, setProperties] = useState<string[]>([])

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
  
  const ownedProperties = (): string[] => {
    return properties;
  }

  const inReviewProperties = (): string[] => {
    return properties;
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
          {ownedProperties().length == 0 && <div className="no-results-container">
            <div className="contents">
              <div></div>
              No Properties
            </div>
          </div>}
          {ownedProperties().length > 0 && <div>TODO: Show properties`</div>}
        </div>

        <div>
          <div className="light-label-div">
            In Review
          </div>
          {/* In Review Properties Area */}
          {inReviewProperties().length == 0 && <div className="no-results-container">
            <div className="contents">
              <div></div>
              No Properties In Review
            </div>
          </div>}
          {inReviewProperties().length > 0 && <div>TODO: Show properties`</div>}
        </div>

      </div>

    </div>
  </LandlordViewWrapper>)
}

export default LandlordDashboard