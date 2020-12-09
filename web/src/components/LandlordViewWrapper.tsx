import React, {useState, useEffect} from 'react'
import Centered from './toolbox/layout/Centered'

import LandlordNavbar from './LandlordAuthNavbar'

import AuthAPI from '../API/AuthAPI'
import { RiCheckLine } from 'react-icons/ri'
import { FiFileText } from "react-icons/fi"
import { HiOutlineHome, HiOutlineChatAlt, HiLogout } from "react-icons/hi";
import { useHistory } from 'react-router-dom';
import {usePopup} from '../components/hooks/usePopupHook'
import {useMediaQuery} from 'react-responsive'
import Button from '../components/toolbox/form/Button'

interface IFeedbackInfo {
  bug: boolean
  feature: boolean
  comment: boolean
  feedback_message: string
}

const _submitFeedback_ = async (data: IFeedbackInfo): Promise<any> => {
  
  // TODO implement
}

const LandlordViewWrapper = ({children}: {children: any}) => {

  const [showFeedbackPopup, setShowFeedbackPopup] = useState<boolean>(false)
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
    setShowFeedbackPopup(true)
  }

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

  const [feedbackInfo, setFeedbackInfo] = useState<IFeedbackInfo>({
    feedback_message: "",
    bug: true,
    feature: false,
    comment: false
  })

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
        <LandlordNavbar />
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

export default LandlordViewWrapper