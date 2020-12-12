import React, {useEffect, useState} from 'react'
import Centered from '../components/toolbox/layout/Centered'
import Button from '../components/toolbox/form/Button'
import Input from '../components/toolbox/form/Input'
import CommentBubble from '../components/toolbox/misc/CommentBubble'
import {fetchUser} from '../redux/actions/user'
import {useMediaQuery} from 'react-responsive'

// import StudentAPI from '../API/StudentAPI'
import {useUpdateStudentMutation} from '../API/queries/types/graphqlFragmentTypes'

import _ from 'lodash'
import {useSelector, useDispatch} from 'react-redux'
import {useHistory} from 'react-router'

import {BiCheck, BiUser} from "react-icons/bi"
import { BsAt } from "react-icons/bs";

interface IRegData {
  first_name: string
  last_name: string
  email: string
  confirm_email: string
}

interface IFormError {
  hasError: boolean
  message?: string
}

const StudentRegisterCompleteView = () => {

  const isMobile = useMediaQuery({ query: '(max-width: 500px)' })
  const dispatch = useDispatch()
  const history = useHistory()
  const user = useSelector((state: any) => state.user)
  const [regData, setRegData] = useState<IRegData>({
    first_name: "",
    last_name: "",
    email: "",
    confirm_email: ""
  })

  // 
  const [formError, setFormError] = useState<IFormError>({
    hasError: false
  })

  useEffect(() => {
    // check if the user needs to be on this page
    // (if their data is already filled, they should be redirected to the app home page)
    console.log(`Checking eligibility`)
    checkEligibility()

    const submitOnEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") completeRegistration()
    }

    window.addEventListener('keypress', submitOnEnter)
    
    return () => {
      window.removeEventListener('keypress', submitOnEnter)
    }
  }, [])

  useEffect(() => {
    checkEligibility()
  }, [user])

  const checkEligibility = (): void => {
    if (userDataAlreadyComplete()) {
      history.push('/search')
    }
  }

  const userDataAlreadyComplete = (): boolean => {
    
    if (user == null) return true;
    if (!_.has(user.user, 'first_name') || user.user.first_name == undefined) return false;
    if (!_.has(user.user, 'last_name') || user.user.last_name == undefined) return false;
    if (!_.has(user.user, 'email') || user.user.email == undefined) return false;
    return true;
    
  } 

  const formValid = ():boolean => {
    if (regData.first_name.length === 0) return false;
    if (regData.last_name.length === 0) return false;
    if (regData.email.length === 0) return false;
    if (regData.confirm_email.length === 0) return false;
    if (regData.confirm_email !== regData.email) return false
    return true;
  }

  const [updateStudentInfo, { data: updatedStudentInfo }] = useUpdateStudentMutation()

  const completeRegistration = () => {

    // check if the emails are equivalent
    if (!formValid()) {
      setFormError({
        hasError: true,
        message: "Fields are invalid. Please make sure no fields are empty and that the emails match."
      })
      return;
    }

    if (user == null) {
      setFormError({
        hasError: true,
        message: "Application could not find user's session."
      })
      return;
    }

    updateStudentInfo({
      variables: {
        id: user.user._id,
        first_name: regData.first_name,
        last_name: regData.last_name,
        email: regData.email
      }
    })

    /*
    StudentAPI.updateInfo(
      user.user._id,
      regData.first_name,
      regData.last_name,
      regData.email
    )
    .then((res: any) => {
      console.log(`Update Info response:`)
      console.log(res)

      if (res.data.success) {
        // successfully updated the user data,
        // redux user data should be re-fetched
        dispatch(fetchUser(user, { update: true }))

        // history.push('/search')
      }
      else {
        // error occurred
        setFormError({
          hasError: true,
          message: "Problem occurred on the server. Please try again at a later time."
        })
      }
    })
    */
  }

  useEffect(() => {
    if (updatedStudentInfo) {
      if (updatedStudentInfo.updateStudent.success) {
        dispatch(fetchUser(user, { update: true }))
      }
      else {
        setFormError({
          hasError: true,
          message: "Problem occurred on the server. Please try again at a later time."
        })
      }
    }
  }, [updatedStudentInfo])

  return (<Centered width={isMobile ? 300 : 400} height={500}>
    <div>
      {formError.hasError && <div style={{marginBottom: "20px"}}>
        <CommentBubble 
          message={formError.message ? formError.message : ""}
          header="error"
          color="red"
        />
      </div>}

      <div className="title-1" style={{marginBottom: '20px'}}>Complete Registration</div>

      {/* First And Last Name */}
      <div style={{display: 'flex'}}>
        <div style={{width: '50%', paddingRight: '20px'}}>
          <Input label="First Name" 
            icon={<BiUser />}
            onChange={(val) => {
              let reg2 = regData; 
              reg2.first_name = val;
              setRegData(reg2) 
            }}
          />
        </div>
        <div style={{width: '50%'}}>
        <Input label="Last Name" 
          icon={<BiUser />}
          onChange={(val) => { let reg2 = regData; reg2.last_name = val; setRegData(reg2) }}
        />
        </div>
      </div>

      <div className="padded upper">
        <Input label="Email" 
          icon={<BsAt />}
          onChange={(val) => { let reg2 = regData; reg2.email = val; setRegData(reg2) }}
        />
      </div>

      <div className="padded upper">
        <Input label="Confirm Email" 
          icon={<BsAt />}
          onChange={(val) => { let reg2 = regData; reg2.confirm_email = val; setRegData(reg2) }}
        />
      </div>

      <div className="padded upper" style={{width: "50%", float: "right"}}>
        <Button 
          onClick={completeRegistration}
          text="Complete"
          icon={<BiCheck />}
          iconLocation="right"
          background="#63db97"
        />
      </div>

    </div>
  </Centered>)
}

export default StudentRegisterCompleteView