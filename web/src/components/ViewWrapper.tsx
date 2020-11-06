import React, {useState, useEffect} from 'react'
import Centered from './toolbox/layout/Centered'

import Navbar from './AuthNavbar'
import PopupBubble from './toolbox/misc/PopupBubble'

import { BiSearch, BiCollection, BiHomeAlt } from "react-icons/bi";
import { useHistory } from 'react-router-dom';

const ViewWrapper = ({children}: {children: any}) => {

  const history = useHistory()
  const [viewWidth, setViewWidth] = useState<number>(1400)
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
    if (new_width >= 1400) setViewWidth(1400)
    else if (new_width > 1200 && new_width < 1400) setViewWidth(1200)
    else if (new_width < 1200) setViewWidth(new_width - 100)

    if (new_width > 1500) {
      setNavbarMinMode(true)
    }
    else {
      setNavbarMinMode(false)
    }
  }

  const pageLinks = {
    home: {
      target: '/home',
      icon: <BiHomeAlt />,
      name: "Home"
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

  return (<Centered height="100%" width={viewWidth}>
    <React.Fragment>
      <div>
        <Navbar />
      </div>
      <div className="app-view-area">
        <div className="user-navbar">

          {Object.keys(pageLinks).map((page_: string, index: number) => {

            if (navbarMinMode)
              return (<div key={index} style={{marginBottom: '15px'}} onClick={() => history.push((pageLinks as any)[page_].target)}>
                <div className={`icon-link ${window.location.pathname.toLowerCase() === (pageLinks as any)[page_].target.toLowerCase() ? 'active' : ''}`}>
                  {(pageLinks as any)[page_].icon}
                  <div className="link-desc">{(pageLinks as any)[page_].name}</div>
                </div>
              </div>)
            
            else return (<div key={index}
                onClick={() => history.push((pageLinks as any)[page_].target)}
                style={{marginBottom: '15px'}}>
                <PopupBubble
                  message={(pageLinks as any)[page_].name}
                  direction="right"
                  width={60}
                >
                  <div 
                  className={`icon-link ${window.location.pathname.toLowerCase() === (pageLinks as any)[page_].target.toLowerCase() ? 'active' : ''}`}>
                    {(pageLinks as any)[page_].icon}
                  </div>
                </PopupBubble>
              </div>)

          })}

          {/* Search Link */}
          {/* <div style={{marginBottom: '15px'}}>
            <PopupBubble
              message="Search"
              direction="left"
              width={60}
            >
              <div className="icon-link active">
                <BiSearch />
              </div>
            </PopupBubble>
          </div> */}
          
          {/* Collection Link */}
          {/* <div style={{marginBottom: '15px'}}>
            <PopupBubble
              message="Collection"
              direction="left"
              width={80}
            >
              <div className="icon-link">
                <BiCollection />
              </div>
            </PopupBubble>
          </div> */}

        </div>
        <div className="content-area">
          {children}
        </div>
      </div>
    </React.Fragment>
  </Centered>)
}

export default ViewWrapper