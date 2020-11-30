import React, {useState, useEffect} from 'react'
import Centered from './toolbox/layout/Centered'

import LandlordNavbar from './LandlordAuthNavbar'

import { FiFileText } from "react-icons/fi"
import { HiOutlineHome } from "react-icons/hi";
import { useHistory } from 'react-router-dom';
import {useMediaQuery} from 'react-responsive'

const LandlordViewWrapper = ({children}: {children: any}) => {

  const isTablet = useMediaQuery({ query: '(max-width: 1000px)' })
  const history = useHistory()
  // const [viewWidth, setViewWidth] = useState<number>(1400)

  useEffect(() => {
    const handleResize = (e:any) => {
      let w = e.target.innerWidth
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const pageLinks = {
    properties: {
      target: '/landlord/properties',
      icon: <HiOutlineHome />,
      name: "Properties"
    },
    leases: {
      target: '/landlord/leases',
      icon: <FiFileText />,
      name: "Leases"
    }
  }

  return (<Centered height="100%" horizontalBuffer={isTablet? 150 : 400}>
    <React.Fragment>
      <div>
        <LandlordNavbar />
      </div>
      <div className="app-view-area" style={{
        // width: `${viewWidth}px`,
        // maxWidth: `${viewWidth}px`
      }}>
        <div className="user-navbar">

          {Object.keys(pageLinks).map((page_: string, index: number) => {

              return (<div key={index} style={{marginBottom: '15px'}} onClick={() => history.push((pageLinks as any)[page_].target)}>
                <div className={`icon-link ${window.location.pathname.toLowerCase() === (pageLinks as any)[page_].target.toLowerCase() ? 'active' : ''}`}>
                  <div className="icon-holder">{(pageLinks as any)[page_].icon}</div>
                  <div className="link-desc">{(pageLinks as any)[page_].name}</div>
                </div>
              </div>)

          })}

        </div>
        <div className="content-area">
          {children}
        </div>
      </div>
    </React.Fragment>
  </Centered>)
}

export default LandlordViewWrapper