import React, {useState, useEffect, useRef, ChangeEvent} from 'react'
import {useSpring, useTransform, motion} from 'framer-motion'

import AuthAPI from '../API/AuthAPI'

import Button from '../components/toolbox/form/Button'
import {RiCheckLine} from 'react-icons/ri'
import {usePopup} from '../components/hooks/usePopupHook'
import { HiOutlineNewspaper, HiCheckCircle, HiTerminal, 
  HiOutlineHome, HiLogout, HiClipboard, HiOutlineChatAlt,
  HiOutlineChevronLeft, HiOutlineChevronRight, HiCog } from 'react-icons/hi';
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
  left_attachment?: any
  left_attachment_width?: number
  onContentStart?: (val: number) => void
}

const ViewWrapper = ({children, 
  left_attachment, 
  left_attachment_width,
  onContentStart}: ViewWrapperProps) => {

  const contentStartRef = useRef<HTMLDivElement>(null)
  const contentEndRef = useRef<HTMLDivElement>(null)
  const [SubmitFeedback, {data: submissionData}] = useSubmitFeedbackMutation()
  const user = useSelector((state: ReduxState) => state.user)
  // const [viewWidth, setViewWidth] = useState<number>(1400)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false)
  const [menuCollapsed, setMenuCollapsed] = useState<boolean>(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)

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

  const institution = useSelector((state: ReduxState) => state.institution)
  const getSchoolThumbSource = (): string => {
    console.log(`getSchoolThumbSource()`)
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
    if (sidebarCollapsed) sidebarCollapseIntermediate.set(0)
    else sidebarCollapseIntermediate.set(1)
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
    // menuCollapseIntermediate.set(menuCollapsed ? 0 : 1);
  }, [])

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
        <div className={`user-control ${menuCollapsed ? 'collapsed' : ''}`}>
        {user && user.type && user.type == "student" && <div 
        className={`photo-thumb ${menuCollapsed ? 'collapsed' : ''}`}
        onClick={() => setUserControlVisible(!userControlVisible)}>
          <img src={getSchoolThumbSource()} width="100%" />
          <motion.div className="user-settings" style={{
            opacity: userControlSettingsCollapsed
          }}><HiCog /></motion.div>
        </div>}
          <motion.div onClick={() => setUserControlVisible(!userControlVisible)} className="text-area" style={{
            opacity: menuCollapseInitSpring
          }}>
            {user && user.user && `${user.user.first_name} ${user.user.last_name}`}
              <div className="arrow-icon"><HiOutlineChevronRight /></div>
            </motion.div>

            {userControlVisible && <div className="user-control-menu">
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
            </div>}
        </div>
      </div>

    </div>

    {(left_attachment && left_attachment_width)?
      <div className="left-attachment-ctrl" style={{
        width: `${left_attachment_width}px`,
        right: `${-1 * (left_attachment_width + 50)}px`
      }}>{left_attachment}
        <div className="content-start-indicator" ref={contentStartRef} />
      </div>
      : <div className="left-no-attachment-ctrl">
          <div className="content-start-indicator"
        ref={contentStartRef} />
      </div>
    }

    </motion.div>

    <motion.div className="vertical-sidebar" style={{
      width: sidebarWidthCollapseTransform
    }}>
      <div 
        onClick={() => {setSidebarCollapsed(!sidebarCollapsed)}}
        className={`menu-collapse-btn ${sidebarCollapsed? 'collapsed' : ''}`}>
        <HiOutlineChevronLeft />
      </div>
      <div className="content-end-indicator" ref={contentEndRef} />

    </motion.div>

    {/* <Centered height="100%" horizontalBuffer={isTablet? 150 : 600}> */}
    <motion.div style={{
      marginLeft: leftContainerMarginTransform,
      marginRight: rightContainerMarginTransform,
      // border: `1px solid orange`,
      margin: `0 auto`
    }}>
      <React.Fragment>
        <div style={{marginTop: '20px'}}></div>
        {false && <div style={{border: `1px solid black`}}>
          {/* {user && user.type && user.type == "student" && <Navbar showNavbar={showNavbar} />}
          {user && user.type && user.type == "landlord" && <LandlordNavbar showNavbar={showNavbar} />} */}
        </div>}
        <div className="app-view-area">
          <div className="content-area">
            {children}
          </div>
        </div>
      </React.Fragment>
      </motion.div>
    {/* </Centered> */}


  </React.Fragment>)
}

export default ViewWrapper