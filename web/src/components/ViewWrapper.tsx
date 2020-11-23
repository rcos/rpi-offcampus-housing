import React, {useState, useEffect} from 'react'
import Centered from './toolbox/layout/Centered'

import Navbar from './AuthNavbar'

import { HiOutlineNewspaper } from 'react-icons/hi';
import { BiSearch, BiCollection } from "react-icons/bi";
import { useHistory } from 'react-router-dom';
import {useMediaQuery} from 'react-responsive'

const ViewWrapper = ({children}: {children: any}) => {

  const isTablet = useMediaQuery({ query: '(max-width: 1000px)' })
  const history = useHistory()
  // const [viewWidth, setViewWidth] = useState<number>(1400)
  const [navbarMinMode, setNavbarMinMode] = useState<boolean>(false)

  useEffect(() => {
    const handleResize = (e:any) => {
      let w = e.target.innerWidth
      updateViewWidth(w)
    }

    updateViewWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const updateViewWidth = (new_width: number) => {
    // if (new_width >= 1400) setViewWidth(1400)
    // else if (new_width > 1200 && new_width < 1400) setViewWidth(1200)
    // else if (new_width < 1200) setViewWidth(new_width - 100)

    if (new_width > 1000) {
      setNavbarMinMode(true)
    }
    else {
      setNavbarMinMode(false)
    }
  }

  const pageLinks = {
    home: {
      target: '/feed',
      icon: <HiOutlineNewspaper />,
      name: "Feed"
    },
    search: {
      target: '/search',
      icon: <BiSearch />,
      name: 'Search'
    },
    collection: {
      target: '/collection',
      icon: <BiCollection />,
      name: 'Collection'
    }
  }

  return (<Centered height="100%" horizontalBuffer={isTablet? 150 : 400}>
    <React.Fragment>
      <div>
        <Navbar />
      </div>
      <div className="app-view-area" style={{
        // width: `${viewWidth}px`,
        // maxWidth: `${viewWidth}px`
      }}>
        <div className="user-navbar">

          {Object.keys(pageLinks).map((page_: string, index: number) => {

              return (<div key={index} style={{marginBottom: '10px'}} onClick={() => history.push((pageLinks as any)[page_].target)}>
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

export default ViewWrapper