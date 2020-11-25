import React, {useState, useEffect, useRef, ChangeEvent} from 'react'
import Centered from './toolbox/layout/Centered'

import Navbar from './AuthNavbar'
import AuthAPI from '../API/AuthAPI'

import Button from '../components/toolbox/form/Button'
import {RiCheckLine, RiBugLine} from 'react-icons/ri'
import {usePopup} from '../components/hooks/usePopupHook'
import { HiOutlineNewspaper, HiLogout, HiOutlineChatAlt } from 'react-icons/hi';
import { BiSearch, BiCollection } from "react-icons/bi";
import { useHistory } from 'react-router-dom';
import {useMediaQuery} from 'react-responsive';
import axios from 'axios';

interface IFeedbackInfo {
  bug: boolean
  feature: boolean
  comment: boolean
  feedback_message: string
}

const _submitFeedback_ = async (data: IFeedbackInfo): Promise<any> => {
  
  // TODO implement
}

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

    let height_ = viewportHeight - bounding.top - 20
    containerRef.current.style.height = `${height_}px`
  }

  useEffect(() => {
    setHeight ()
    let t_1 = setTimeout(setHeight, 50)
    let t_2 = setTimeout(setHeight, 100)
    let t_3 = setTimeout(setHeight, 200)
    let t_4 = setTimeout(setHeight, 400)

    window.addEventListener('resize', setHeight)

    return () => {
      window.removeEventListener('resize', setHeight)
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

  
  const [showFeedbackPopup, setShowFeedbackPopup] = useState<boolean>(false)
  const [feedbackInfo, setFeedbackInfo] = useState<IFeedbackInfo>({
    feedback_message: "",
    bug: true,
    feature: false,
    comment: false
  })

  const submitFeedback = () => {

    // at least 1 tag must be selected
    if (!feedbackInfo.comment && !feedbackInfo.bug && !feedbackInfo.comment) {
      alert ("Please select a tag.")
      return;
    }

    _submitFeedback_(feedbackInfo)
    .then(res => {
      console.log(`Res 2`)
      console.log(res)
    })
    .catch(err => {
      console.log(`Err 2`)
      console.log(err)
    })

  }

  const initFeedback = () => {
    setShowFeedbackPopup(true)
  }

  const popup = usePopup({
    show: showFeedbackPopup,
    popup: (<div className="popup-container">
      <div className="title">Feedback</div>
      <div className="body">

        <div>

          <div className={`selectable-label ${feedbackInfo.bug ? 'active' : ''}`} onClick={() => {
            let feedbackInfo_ = {...feedbackInfo};
            feedbackInfo_.bug = !feedbackInfo_.bug;
            setFeedbackInfo(feedbackInfo_)
          }}>Bug</div>
          <div className={`selectable-label ${feedbackInfo.feature ? 'active' : ''}`} onClick={() => {
            let feedbackInfo_ = {...feedbackInfo};
            feedbackInfo_.feature = !feedbackInfo_.feature;
            setFeedbackInfo(feedbackInfo_)
          }}>Feature</div>
          <div className={`selectable-label ${feedbackInfo.comment ? 'active' : ''}`} onClick={() => {
            let feedbackInfo_ = {...feedbackInfo};
            feedbackInfo_.comment = !feedbackInfo_.comment;
            setFeedbackInfo(feedbackInfo_)
          }}>Comment</div>

        </div>
        
        <div className="textarea-holder" style={{marginTop: '10px'}}>
          <textarea onChange={(e: any) => {
            let feedbackInfo_ = {...feedbackInfo};
            feedbackInfo_.feedback_message = e.target.value
            setFeedbackInfo(feedbackInfo_)
          }}></textarea>
        </div>

      </div>
      <div className="footer">
      <div className="left-action">
          <Button 
            onClick={() => {setShowFeedbackPopup(false)}}
            text="cancel"
            background="#E4E4E4"
          />
        </div>

        <div className="right-action">
          <Button 
            onClick={() => {
              submitFeedback()
            }}
            text="submit"
            icon={<RiCheckLine />}
            iconLocation="right"
            background="#99E1D9"
          />
        </div>
      </div>
    </div>)
  })

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