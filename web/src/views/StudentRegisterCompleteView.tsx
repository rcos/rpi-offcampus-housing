import React, {useEffect, useState} from 'react'
import Centered from '../components/toolbox/layout/Centered'
import Button from '../components/toolbox/form/Button'
import Input from '../components/toolbox/form/Input'
import CommentBubble from '../components/toolbox/misc/CommentBubble'
import {updateUser} from '../redux/actions/user'

import StudentAPI from '../API/StudentAPI'

import _, { update } from 'lodash'
import {useSelector, useDispatch} from 'react-redux'
import {useHistory} from 'react-router'

import {BiCheck} from "react-icons/bi"

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

  const dispatch = useDispatch()
  const history = useHistory()
  const user = useSelector((state: any) => state.user)
  const [regData, setRegData] = useState<IRegData>({
    first_name: "",
    last_name: "",
    email: "",
    confirm_email: ""
  })

  // stores whether or not the user is eligible to submit this function
  // (needed in case the redirect on load is slower than the user submitting the application)
  const [eligeble, setEligibility] = useState<boolean>(false)

  // 
  const [formError, setFormError] = useState<IFormError>({
    hasError: false
  })

  useEffect(() => {
    // check if the user needs to be on this page
    // (if their data is already filled, they should be redirected to the app home page)
    checkEligibility()
  }, [])

  useEffect(() => {
    checkEligibility()
  }, [user])

  const checkEligibility = (): void => {
    userDataAlreadyComplete()
    .then((user_complete: boolean) => {
      console.log(`User complete? ${user_complete}`)
      if (user_complete) history.push('/search')
      else setEligibility(true)
    })
  }

  const userDataAlreadyComplete = async (): Promise<boolean> => {
    return user.then((user_data: any) => {
      console.log(user_data)
      console.log(user_data)
      if (user_data == null) return true;
      if (!_.has(user_data.user, 'first_name')) return false;
      if (!_.has(user_data.user, 'last_name')) return false;
      if (!_.has(user_data.user, 'email')) return false;
      return true;
    })
  } 

  const formValid = ():boolean => {
    if (regData.first_name.length == 0) return false;
    if (regData.last_name.length == 0) return false;
    if (regData.email.length == 0) return false;
    if (regData.confirm_email.length == 0) return false;
    if (regData.confirm_email != regData.email) return false
    return true;
  }

  const completeRegistration = () => {

    // check if the emails are equivalent
    if (!formValid()) {
      setFormError({
        hasError: true,
        message: "Fields are invalid. Please make sure no fields are empty and that the emails match."
      })
      return;
    }

    user.then((user_data: any) => {
      
      console.log(user_data)

      StudentAPI.updateInfo(
        user_data.user._id,
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
          dispatch(updateUser())

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

    })
  }

  return (<Centered width={400} height={500}>
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
            onChange={(val) => {
              let reg2 = regData; 
              reg2.first_name = val;
              setRegData(reg2) 
            }}
          />
        </div>
        <div style={{width: '50%'}}>
        <Input label="Last Name" 
          onChange={(val) => { let reg2 = regData; reg2.last_name = val; setRegData(reg2) }}
        />
        </div>
      </div>

      <div className="padded upper">
        <Input label="Email" 
          onChange={(val) => { let reg2 = regData; reg2.email = val; setRegData(reg2) }}
        />
      </div>

      <div className="padded upper">
        <Input label="Confirm Email" 
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