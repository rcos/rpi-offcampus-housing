import React, {useState, useEffect, useRef, ChangeEvent} from 'react'
import {useSpring, useTransform, motion} from 'framer-motion'

import AuthAPI from '../API/AuthAPI'

import Popup, {PopupHeader, ConfirmLine} from '../components/toolbox/misc/Popup'
import { HiOutlineNewspaper, HiCheckCircle, HiTerminal, 
  HiLogout, HiClipboard, HiOutlineChatAlt,
  HiOutlineChevronLeft, HiOutlineChevronRight, HiCog } from 'react-icons/hi';
import {RiLayoutMasonryLine} from 'react-icons/ri';
import { FiFileText } from 'react-icons/fi';
import { BiSearch, BiCollection } from "react-icons/bi";
import { Link } from 'react-router-dom';
import {useSelector} from 'react-redux'
import {ReduxState} from '../redux/reducers/all_reducers'
import {useSubmitFeedbackMutation} from '../API/queries/types/graphqlFragmentTypes'
import {objectURI} from '../API/S3API'

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

interface ViewWrapperProps {
  children: any
  sidebar_content?: any
  left_attachment?: any
  left_attachment_width?: number
  onContentStart?: (val: number) => void
  hide_sidebar?: boolean
}

const ViewWrapper = ({children, 
  left_attachment, 
  left_attachment_width,
  sidebar_content,
  hide_sidebar,
  onContentStart}: ViewWrapperProps) => {

  const [DEBUG_MODE, SET_DEBUG_MODE] = useState<boolean>(true)

  const contentStartRef = useRef<HTMLDivElement>(null)
  const contentEndRef = useRef<HTMLDivElement>(null)
  const [SubmitFeedback, {data: submissionData}] = useSubmitFeedbackMutation()
  const user = useSelector((state: ReduxState) => state.user)
  // const [viewWidth, setViewWidth] = useState<number>(1400)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false)
  const [menuCollapsed, setMenuCollapsed] = useState<boolean>(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(hide_sidebar ? true : false)

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

  const [pageLinks, setPageLinks] = useState<{[key: string]: PageLinkInfo}>({})
  const userControlMenuRef = useRef<HTMLDivElement>(null)
  const userControlInitiatorRef = useRef<HTMLDivElement>(null)

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
            target: '/landlord/dashboard',
            icon: <RiLayoutMasonryLine />,
            name: "Dashboard"
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
    return false;
  }

  const logout = () => {
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

  const institution = useSelector((state: ReduxState) => state.institution)
  const getSchoolThumbSource = (): string => {
    if ((user && user.type && user.type != "student") || institution == null) return '';
    return objectURI(institution.s3_thumb_key, {width: 60, height: 60})
  }
  const [userControlVisible, setUserControlVisible] = useState<boolean>(false) 

  // collapsed menu logic
  const menuCollapseInitSpring = useSpring(menuCollapsed ? 0 : 1)
  const menuLabelHeightTransform = useTransform(menuCollapseInitSpring, (x: number) => `${x * 30}px`)
  const menuSubtitleOpacityTransform = useTransform(menuCollapseInitSpring, [0, 1], [0, 0.5])

  const menuCollapseIntermediate = useSpring(menuCollapsed ? 0 : 1)
  const menuWidthCollapseTransform = useTransform(menuCollapseIntermediate, [0, 1], [60, 200])
  const userControlSettingsCollapsed = useTransform(menuCollapseIntermediate, [0, 1], [1, 0])
  const leftContainerMarginTransform = useTransform(menuCollapseIntermediate, (x: number) => {
    if (contentStartRef.current) {
      let bounds_ = contentStartRef.current.getBoundingClientRect();
      return `${bounds_.right}px`;
    }
    return`${((200 - 60) * x) + 60 + 50}px`
  })

  // collapse sidebar logic
  const sidebarCollapseInitSpring = useSpring(sidebarCollapsed ? 0 : 1)

  const sidebarCollapseIntermediate = useSpring(sidebarCollapsed ? 0 : 1)
  const sidebarWidthCollapseTransform = useTransform(sidebarCollapseIntermediate, [0, 1], [0, 200])
  const rightContainerMarginTransform = useTransform(sidebarCollapseIntermediate, (x: number) => {
    if (contentEndRef.current) {
      let bounds_ = contentEndRef.current.getBoundingClientRect();
      return `${document.documentElement.clientWidth - bounds_.left}px`;
    }
    // return `${((200 - 60) * x) + 60 + 50}px`
    return `0px`
  })

  useEffect(() => {
    if (!hide_sidebar) {
      if (sidebarCollapsed) {
        sidebarCollapseInitSpring.set(0)
      }
      else {
        sidebarCollapseIntermediate.set(1)
      }
    }

    let unmountSidebarCollapseInitSpring = sidebarCollapseInitSpring.onChange((x: number) => {
      if (x == 0) sidebarCollapseIntermediate.set(0)
    })
    let unmountSidebarCollapseIntermediate = sidebarCollapseIntermediate.onChange((x: number) => {
      if (x == 1) sidebarCollapseInitSpring.set(1)
    })

    return () => {
      unmountSidebarCollapseInitSpring();
      unmountSidebarCollapseIntermediate()
    }
  }, [sidebarCollapsed])

  /**
   * menuCollapsed effector
   */
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

  useEffect(() => {
    const updateContentStart = () => {
      if (contentStartRef.current) {
        let bounds_ = contentStartRef.current.getBoundingClientRect();
        if (onContentStart) {
          onContentStart(bounds_.right)
        }
      }
    }

    updateContentStart()
    window.addEventListener(`resize`, updateContentStart)
    return () => {
      window.removeEventListener(`resize`, updateContentStart)
    }
  }, [contentStartRef])

  useEffect(() => {
    menuCollapseIntermediate.set(menuCollapsed ? 0.000000000001 : 9.999999999999);

    const toggleDebugMode = (e: KeyboardEvent) => {
      if (e.key === "q") SET_DEBUG_MODE (false)
      if (e.key === "w") SET_DEBUG_MODE (true)
    }
    
    // set debug mode event listener
    window.addEventListener(`keypress`, toggleDebugMode)
    return () => {
      window.removeEventListener(`keypress`, toggleDebugMode)
    }
  }, [])

  useEffect(() => {
    const handleClose = (e: any) => {
      if (userControlMenuRef.current && userControlInitiatorRef.current) {
        if (!userControlMenuRef.current.contains(e.target) && !userControlInitiatorRef.current.contains(e.target)) {
          setUserControlVisible(false)
        }
      }
    }

    window.addEventListener(`click`, handleClose)
    return () => {
      window.removeEventListener(`click`, handleClose)
    }
  }, [userControlMenuRef])

  useEffect(() => {
    if (userControlVisible) {
      userControlSpring.set(1)
    }
    else userControlSpring.set(0)
  }, [userControlVisible])
  const userControlSpring = useSpring(0)
  const userControlRotateY = useTransform(userControlSpring, [0, 1], [-30, 0])
  const userControlTranslateX = useTransform(userControlSpring, [0, 1], [-40, 0])
  const userControlVisibility = useTransform(userControlSpring, (x: number) => {
    return x < 0.01 ? 'hidden' : 'visible'
  })

  return (<React.Fragment>

    {/* Feedback Popup */}
    
    <Popup
      width={500}
      height={`auto`}
      show={showFeedbackPopup}>
      <PopupHeader withClose={true}>Feedback</PopupHeader>

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
        <div className="body" style={{padding: `0 12px`}}>

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
        <ConfirmLine
          onCancel={() => setShowFeedbackPopup(false)}
          onConfirm={() => submitFeedback()}
          confirmButtonText="Submit Feedback"
          withCancel={true}
        />
      </div>}
    </Popup>

    <motion.div className={`vertical-navbar ${menuCollapsed ? 'collapsed': ''}`} style={{
      width: menuWidthCollapseTransform
    }}>

      <div className="logo-line">
        <div className="logo-area"><div className="app-logo" /></div>
        <motion.div className="logo-text" style={{opacity: menuCollapseInitSpring}}>offcmpus</motion.div>
        <div className={`menu-collapse-btn ${menuCollapsed? 'collapsed' : ''}`} onClick={() => setMenuCollapsed(!menuCollapsed)}><HiOutlineChevronLeft /></div>
      </div>

      {/* Menu Area */}
      <div className="top-bottom-menu-separator">
        <div className="top-area">
          <motion.div className="menu-label" style={{
            opacity: menuSubtitleOpacityTransform,
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
              opacity: menuSubtitleOpacityTransform,
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

      </div>
      <div className="bottom-area">
        <div ref={userControlInitiatorRef} className={`user-control ${menuCollapsed ? 'collapsed' : ''}`}>
        {user && user.type && user.type == "student" ? <div
        className={`photo-thumb ${menuCollapsed ? 'collapsed' : ''}`}
        onClick={() => setUserControlVisible(!userControlVisible)}>
          <img src={getSchoolThumbSource()} width="100%" />
          <motion.div className="user-settings" style={{
            opacity: userControlSettingsCollapsed
          }}><HiCog /></motion.div>
        </div>
        :
        <div 
          className={`photo-thumb icon ${menuCollapsed ? 'collapsed' : ''}`}
          onClick={() => setUserControlVisible(!userControlVisible)}>
          <HiCog />
        </div>
        }
          <motion.div onClick={() => setUserControlVisible(!userControlVisible)} className="text-area" style={{
            opacity: menuCollapseInitSpring
          }}>
            {user && user.user && `${user.user.first_name} ${user.user.last_name}`}
              <div className="arrow-icon"><HiOutlineChevronRight /></div>
            </motion.div>

            <motion.div 
            style={{
              rotateY: userControlRotateY,
              translateX: userControlTranslateX,
              opacity: userControlSpring,
              visibility: userControlVisibility,
              perspective: `6.5cm`
            }}
            className="user-control-menu"
            ref={userControlMenuRef}>
              <div className="header">User Control</div><div className="control-menu">

                {/* Settings */}
                <div className="ctrl-menu-item">
                  <div className="ctrl-icon-area"><HiCog/></div>
                  <div className="ctrl-text-area">Settings</div>
                </div>

                {/* Feedback */}
                <div className="ctrl-menu-item" onClick={initFeedback}>
                  <div className="ctrl-icon-area"><HiOutlineChatAlt/></div>
                  <div className="ctrl-text-area">Feedback</div>
                </div>

                {/* Logout */}
                <div className="ctrl-menu-item" onClick={logout}>
                  <div className="ctrl-icon-area"><HiLogout /></div>
                  <div className="ctrl-text-area">Logout</div>
                </div>
              </div>
            </motion.div>
        </div>
      </div>

    </div>

    {(left_attachment && left_attachment_width)?
      <div className="left-attachment-ctrl" style={{
        width: `${left_attachment_width}px`,
        right: `${-1 * (left_attachment_width + 50)}px`,
        border: DEBUG_MODE ? `1px solid blue` : ``,
        boxSizing: 'border-box'
      }}>{left_attachment}
        <div className="content-start-indicator" 
        style={{opacity: DEBUG_MODE? 1 : 0}}
        ref={contentStartRef} />
      </div>
      : <div className="left-no-attachment-ctrl"
      style={{
        border: DEBUG_MODE ? `1px solid blue` : ``,
        boxSizing: 'border-box'
      }}>
          <div className="content-start-indicator"
          style={{opacity: DEBUG_MODE? 1 : 0}}
        ref={contentStartRef} />
      </div>
    }

    </motion.div>

    <motion.div className="vertical-sidebar" style={{
      width: sidebarWidthCollapseTransform
    }}>
      {!hide_sidebar && <div 
        onClick={() => {setSidebarCollapsed(hide_sidebar ? true : !sidebarCollapsed)}}
        className={`menu-collapse-btn ${sidebarCollapsed? 'collapsed' : ''}`}>
        <HiOutlineChevronLeft />
      </div>}
      <div className="content-end-indicator" ref={contentEndRef} 
        style={{opacity: DEBUG_MODE? 1 : 0}}
      />

      <motion.div style={{
        opacity: sidebarCollapseInitSpring
      }}>
        {sidebar_content}
      </motion.div>

    </motion.div>

    {/* <Centered height="100%" horizontalBuffer={isTablet? 150 : 600}> */}
    <motion.div style={{
      marginLeft: leftContainerMarginTransform,
      marginRight: rightContainerMarginTransform,
      margin: `0 auto`
    }}>
      <React.Fragment>
        <div style={{marginTop: '20px'}}></div>
        <div className="app-view-area">
          <div className="content-area" style={{
            border: DEBUG_MODE ? `1px solid red` : ``,
            boxSizing: 'border-box'
          }}>
            {children}
          </div>
        </div>
      </React.Fragment>
      </motion.div>
    {/* </Centered> */}


  </React.Fragment>)
}

export default ViewWrapper