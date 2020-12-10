import React, {useState, useEffect, useRef, ChangeEvent} from 'react'
import {useSpring, useTransform, motion} from 'framer-motion'
import Centered from './toolbox/layout/Centered'

import Navbar from './AuthNavbar'
import LandlordNavbar from './LandlordAuthNavbar'
import AuthAPI from '../API/AuthAPI'

import Logo from '../components/Logo'
import Button from '../components/toolbox/form/Button'
import {RiCheckLine, RiBugLine} from 'react-icons/ri'
import {usePopup} from '../components/hooks/usePopupHook'
import { HiOutlineNewspaper, HiCheckCircle, HiTerminal, 
  HiOutlineHome, HiLogout, HiClipboard, HiOutlineChatAlt,
  HiOutlineChevronLeft } from 'react-icons/hi';
import { FiFileText } from 'react-icons/fi';
import { BiSearch, BiCollection } from "react-icons/bi";
import { useHistory, Link } from 'react-router-dom';
import {useMediaQuery} from 'react-responsive';
import {useSelector} from 'react-redux'
import {ReduxState} from '../redux/reducers/all_reducers'
import {Student} from '../API/queries/types/graphqlFragmentTypes'
import {useSubmitFeedbackMutation} from '../API/queries/types/graphqlFragmentTypes'

interface IFeedbackInfo {
  bug: boolean
  feature: boolean
  comment: boolean
  feedback_message: string
}

interface PageLinkInfo {
  target: string,
  icon: any,
  name: string
}

const ViewWrapper = ({children, showNavbar}: {children: any, showNavbar?: boolean}) => {

  const [SubmitFeedback, {data: submissionData}] = useSubmitFeedbackMutation()
  const user = useSelector((state: ReduxState) => state.user)
  const containerRef = useRef<HTMLDivElement>(null)
  const isTablet = useMediaQuery({ query: '(max-width: 1000px)' })
  const history = useHistory()
  // const [viewWidth, setViewWidth] = useState<number>(1400)
  const [navbarMinMode, setNavbarMinMode] = useState<boolean>(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false)
  const [menuCollapsed, setMenuCollapsed] = useState<boolean>(false)

  const setHeight = () => {
    // set the height
    if (containerRef.current == null) return;
    let bounding = containerRef.current.getBoundingClientRect()
    let viewportHeight = document.documentElement.clientHeight

    let height_ = viewportHeight - bounding.top - 20
    containerRef.current.style.height = `${height_}px`
  }

  useEffect(() => {
    if (submissionData) {
      setFeedbackSubmitted(true)
    }
  },[submissionData])

  useEffect(() => {
    let u_1: any = null;
    let u_2: any = null;
    if (feedbackSubmitted) {
      // hide popup in 3 seconds
      u_1 = setTimeout(() => {
        setShowFeedbackPopup(false)
      }, 1500)
      u_2 = setTimeout(() => {
        setFeedbackSubmitted(false)
      }, 2500)
    }

    return () => {
      if (u_1 != null) clearTimeout(u_1)
      if (u_2 != null) clearTimeout(u_2)
    }
  }, [feedbackSubmitted])

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

  const [pageLinks, setPageLinks] = useState<{[key: string]: PageLinkInfo}>({})

  useEffect(() => {
    if (user){
      
      if (user.type && user.type == "student") {
        setPageLinks({
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
        })
      }

      else if (user.type && user.type == "landlord") {
        setPageLinks({
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
        })
      }
    }
  }, [user])

  const reviewerLinks = {
    mod_console: {
      target: '/mod/console',
      icon: <HiTerminal />,
      name: "Mod Console"
    },
    ownerships: {
      target: '/ownership/review',
      icon: <HiClipboard />,
      name: "Ownerships"
    }
  }

  const isOwnershipReviewer = (): boolean => {
    if (user && user.type && user.type == "student" && user.user && user.user.elevated_privileges) {
      return user.user.elevated_privileges.includes("ownership_reviewer")
    }
    else {
    }
    return false;
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

  const getFeedbackTags = (): string[] => {
    let tags_ = [];
    if (feedbackInfo.bug) tags_.push('bug')
    if (feedbackInfo.feature) tags_.push('feature')
    if (feedbackInfo.comment) tags_.push('comment')
    return tags_
  }
  const submitFeedback = () => {

    // at least 1 tag must be selected
    if (!feedbackInfo.comment && !feedbackInfo.bug && !feedbackInfo.comment) {
      alert ("Please select a tag.")
      return;
    }

    SubmitFeedback({
      variables: {
        submitter_id: user && user.user ? user.user._id : '',
        user_type: user && user.type ? user.type : '',
        message: feedbackInfo.feedback_message,
        tags: getFeedbackTags()
      }
    })
  }

  const initFeedback = () => {
    setShowFeedbackPopup(true)
  }

  const popup = usePopup({
    show: showFeedbackPopup,
    popup: (<div className="popup-container">
      <div className="title">Feedback</div>
      {feedbackSubmitted && <div className="feedback-submitted"
        style={{
          padding: `10px 5px`
        }}
      >
        <div className="icon-area"><HiCheckCircle /></div><div className="text-area">
          Thanks for the feedback!
        </div>
      </div>}
      {!feedbackSubmitted && <div>
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
      </div>}
    </div>)
  })

  // collapsed menu logic
  const menuCollapseInitSpring = useSpring(menuCollapsed ? 0 : 1)
  const menuLabelHeightTransform = useTransform(menuCollapseInitSpring, (x: number) => `${x * 30}px`)

  const menuCollapseIntermediate = useSpring(menuCollapsed ? 0 : 1)
  const menuWidthCollapseTransform = useTransform(menuCollapseIntermediate, [0, 1], [60, 200])

  useEffect(() => {
    if (menuCollapsed) {
      menuCollapseInitSpring.set(0)
    }
    else {
      menuCollapseIntermediate.set(1)
    }

    let unsubMotionCollapseInitSpring = menuCollapseInitSpring.onChange((x: number) => {
      if (x == 0) menuCollapseIntermediate.set(0)
    })

    let unsubMenuCollapseIntermediate = menuCollapseIntermediate.onChange((x: number) => {
      if (x == 1) menuCollapseInitSpring.set(1)
    })

    return () => {
      unsubMotionCollapseInitSpring()
      unsubMenuCollapseIntermediate()
    }
  }, [menuCollapsed])

  return (<React.Fragment>

    <motion.div className={`vertical-navbar ${menuCollapsed ? 'collapsed': ''}`} style={{
      width: menuWidthCollapseTransform
    }}>

      <div className="logo-line">
        <div className="logo-area"><div className="app-logo" /></div>
        <motion.div className="logo-text" style={{opacity: menuCollapseInitSpring}}>offcmpus</motion.div>
        <div className={`menu-collapse-btn ${menuCollapsed? 'collapsed' : ''}`} onClick={() => setMenuCollapsed(!menuCollapsed)}><HiOutlineChevronLeft /></div>
      </div>

      {/* Menu Area */}
      <motion.div className="menu-label" style={{
        opacity: menuCollapseInitSpring,
        height: menuLabelHeightTransform
      }}>menu</motion.div>
      <div className={`collapse-separator ${menuCollapsed ? 'collapsed' : ''}`} />

      {Object.keys(pageLinks).map((page_: any, index: number) => 
      (<Link to={pageLinks[page_].target} key={index}>
        <div className={`menu-link ${window.location.pathname.toLowerCase() === pageLinks[page_].target.toLowerCase() ? 'active' : ''}`}>
          <div className={`icon ${menuCollapsed ? 'collapsed' : ''}`}>{pageLinks[page_].icon}</div>
          <motion.div className="text" style={{opacity: menuCollapseInitSpring}}>{pageLinks[page_].name}</motion.div>
      </div>
      </Link>))}

    {isOwnershipReviewer() &&
      <React.Fragment>
        <motion.div className="menu-label" style={{
          opacity: menuCollapseInitSpring,
          height: menuLabelHeightTransform
        }}>moderator</motion.div>
        <div className={`collapse-separator ${menuCollapsed ? 'collapsed' : ''}`} />
      
        {Object.keys(reviewerLinks).map((page_: any, index: number) => 
        (<Link to={(reviewerLinks as any)[page_].target} key={index}>
          <div className={`menu-link ${window.location.pathname.toLowerCase() === (reviewerLinks as any)[page_].target.toLowerCase() ? 'active' : ''}`}>
            <div className={`icon ${menuCollapsed ? 'collapsed' : ''}`}>{(reviewerLinks as any)[page_].icon}</div>
            <motion.div className="text" style={{opacity: menuCollapseInitSpring}}>{(reviewerLinks as any)[page_].name}</motion.div>
          </div>
        </Link>))}
      </React.Fragment>
    }

    </motion.div>

    <Centered height="100%" horizontalBuffer={isTablet? 150 : 600}>
      <React.Fragment>
        <div style={{marginTop: '60px'}}></div>
        {false && <div style={{border: `1px solid black`}}>
          {/* {user && user.type && user.type == "student" && <Navbar showNavbar={showNavbar} />}
          {user && user.type && user.type == "landlord" && <LandlordNavbar showNavbar={showNavbar} />} */}
        </div>}
        <div className="app-view-area" ref={containerRef}>
          {false && showNavbar != false && <div className="user-navbar">

            {Object.keys(pageLinks).map((page_: string, index: number) => {

                return (<div key={index} style={{marginBottom: '10px'}} onClick={() => history.push((pageLinks as any)[page_].target)}>
                  <div className={`icon-link ${window.location.pathname.toLowerCase() === (pageLinks as any)[page_].target.toLowerCase() ? 'active' : ''}`}>
                    <div className="icon-holder">{(pageLinks as any)[page_].icon}</div>
                    <div className="link-desc">{(pageLinks as any)[page_].name}</div>
                  </div>
                </div>)

            })}

            {isOwnershipReviewer() &&
              <div>
                <div className="submenu-title">moderator</div>
                {Object.keys(reviewerLinks).map((page_: string, index: number) => {

                return (<div key={index} style={{marginBottom: '10px'}} onClick={() => history.push((reviewerLinks as any)[page_].target)}>
                  <div className={`icon-link ${window.location.pathname.toLowerCase() === (reviewerLinks as any)[page_].target.toLowerCase() ? 'active' : ''}`}>
                    <div className="icon-holder">{(reviewerLinks as any)[page_].icon}</div>
                    <div className="link-desc">{(reviewerLinks as any)[page_].name}</div>
                  </div>
                </div>)

                })}
              </div>
            }

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


          </div>}
          <div className="content-area">
            {children}
          </div>
        </div>
      </React.Fragment>
    </Centered>


  </React.Fragment>)
}

export default ViewWrapper