import React, {useState, useEffect, useRef} from 'react'
import Centered from './toolbox/layout/Centered'

import Navbar from './AuthNavbar'
import AuthAPI from '../API/AuthAPI'

import { HiOutlineNewspaper, HiLogout, HiOutlineChatAlt } from 'react-icons/hi';
import { BiSearch, BiCollection } from "react-icons/bi";
import { useHistory } from 'react-router-dom';
import {useMediaQuery} from 'react-responsive'

const ViewWrapper = ({children}: {children: any}) => {

  const containerRef = useRef<HTMLDivElement>(null)
  const isTablet = useMediaQuery({ query: '(max-width: 1000px)' })
  const history = useHistory()
  // const [viewWidth, setViewWidth] = useState<number>(1400)
  const [navbarMinMode, setNavbarMinMode] = useState<boolean>(false)

  const setHeight = () => {
    // set the height
    if (containerRef.current == null) return;
    let bounding = containerRef.current.getBoundingClientRect()
    let viewportHeight = document.documentElement.clientHeight

    console.log(`viewport: ${viewportHeight}`)
    console.log(`Top: ${bounding.top}`, bounding)

    let height_ = viewportHeight - bounding.top - 20
    containerRef.current.style.height = `${height_}px`
  }

  useEffect(() => {
    setHeight ()
    let t_1 = setTimeout(setHeight, 50)
    let t_2 = setTimeout(setHeight, 100)
    let t_3 = setTimeout(setHeight, 200)
    let t_4 = setTimeout(setHeight, 400)

    return () => {
      clearTimeout(t_1)
      clearTimeout(t_2)
      clearTimeout(t_3)
      clearTimeout(t_4)
    }
  }, [containerRef])

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

  const logout = () => {
    // TODO implement logout
    AuthAPI.logout()
    .then(res => {
      
      // clear student auth
      window.location.reload()
    })
    .catch(e => {
      console.log(e)
    })
  }

  const initFeedback = () => {

  }

  return (<Centered height="100%" horizontalBuffer={isTablet? 150 : 400}>
    <React.Fragment>
      <div>
        <Navbar />
      </div>
      <div className="app-view-area" ref={containerRef}>
        <div className="user-navbar">

          {Object.keys(pageLinks).map((page_: string, index: number) => {

              return (<div key={index} style={{marginBottom: '10px'}} onClick={() => history.push((pageLinks as any)[page_].target)}>
                <div className={`icon-link ${window.location.pathname.toLowerCase() === (pageLinks as any)[page_].target.toLowerCase() ? 'active' : ''}`}>
                  <div className="icon-holder">{(pageLinks as any)[page_].icon}</div>
                  <div className="link-desc">{(pageLinks as any)[page_].name}</div>
                </div>
              </div>)

          })}

          {/* Footer Buttons */}
          <div className="bottom-area">
            {/* Feedback */}
            <div className="icon-link" onClick={initFeedback}>
              <div className="icon-holder"><HiOutlineChatAlt /></div>
              <div className="link-desc">Feedback</div>
            </div>
            
            {/* Logout */}
            <div className="icon-link" onClick={logout}>
              <div className="icon-holder"><HiLogout /></div>
              <div className="link-desc">Logout</div>
            </div>
          </div>


        </div>
        <div className="content-area">
          {children}
        </div>
      </div>
    </React.Fragment>
  </Centered>)
}

export default ViewWrapper