import React, { useState, useEffect } from 'react'
import {useHistory} from 'react-router'

import LandlordAPI from '../API/LandlordAPI'
import Centered from '../components/toolbox/layout/Centered'
import Logo from '../components/Logo'
import Input from '../components/toolbox/form/Input'
import Button from '../components/toolbox/form/Button'
import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import { BsAt } from "react-icons/bs";
import { BiKey } from "react-icons/bi";
import {useMediaQuery} from 'react-responsive'
import Error from '../components/toolbox/form/Error'

import {useDispatch, useSelector} from 'react-redux'
import {fetchUser} from '../redux/actions/user'

interface ILoginFields {
  email: string
  password: string
}

interface IFormError {
  hasError: boolean
  message: string
}

const LandlordLogin = () => {

  const isMobile = useMediaQuery({ query: '(max-width: 500px)' })

  const history = useHistory()
  const dispatch = useDispatch()
  const user = useSelector((state: any) => state.user)
  const [formError, setFormError] = useState<IFormError>({
    hasError: false, message: ""
  })
  const [loginFields, setLoginFields] = useState<ILoginFields>({
    email: "", password: ""
  })

  useEffect (() => {

    const submitOnEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleLogin()
    }

    window.addEventListener('keypress', submitOnEnter)
    
    return () => {
      window.removeEventListener('keypress', submitOnEnter)
    }
  }, [])

  const handleLogin = () => {

    if (loginFields.email.length === 0 || loginFields.password.length === 0) {
      setFormError({
        hasError: true,
        message: "Fields must not be left empty"
      })
    }
    else {
      setFormError({
        hasError: false, message: ""
      })
      LandlordAPI.login(loginFields.email, loginFields.password)
      .then(res => {
        if (res.data.success) { 
          dispatch(fetchUser(user, {update: true}))
        }
      })
      .catch(err => {
        setFormError({
          hasError: true,
          message: "Error logging in."
        })
      })
    }

  }

  const fieldCallback = (field_name: 'email' | 'password') => {
    return (new_value: string) => {
      let currentFields: any = loginFields
      currentFields[field_name] = new_value
      setLoginFields(currentFields)
    }
  }

  const clearError = () => {
    setFormError({
      hasError: false,
      message: ''
    })
  }

  return (<Centered width={isMobile ? 300 : 400} height={500}>
    <div>

      {/* Error Area */}

      {/* Header */}
      <div className="padded upper" style={{display: 'flex'}}>
        <div style={{width: '40px', height: '40px'}}>
          <Logo />
        </div>
        <div style={{
          fontWeight: 600,
          fontSize: '1rem',
          lineHeight: '45px',
          marginLeft: '10px'
        }}>
          Landlord Login
        </div>
      </div>

      {formError.hasError && 
      <Error 
        message={formError.message}
        type='error'
      />}

      <div className="padded upper">
        <Input 
          label="email"
          onChange={fieldCallback('email')}
          icon={<BsAt />}
        />
      </div>
      <div className="padded upper">
        <Input 
          label="password"
          type="password"
          icon={<BiKey />}
          onChange={fieldCallback('password')}
        />
      </div>

      <div className="padded upper">
        <LeftAndRight
          left={<div style={{fontSize: '0.8rem'}}>Forgot password?</div>}
          right={<Button 
            text="Login"
            onClick={handleLogin}
            textColor="white"
            background="#96b5b1"
            iconLocation="right"
          />}
        />
      </div>

      {/* Horizontal Line */}
      <div className="padded upper">
        <div className="horizontal-line">
          <div className="label">or</div>
        </div>
      </div>

      <div className="padded upper">
        <LeftAndRight 
          left={<div style={{fontSize: '0.8rem'}}>
            Don't have an account?
          </div>}
          right={<Button 
            text="Sign Up"
            textColor="white"
            background="#3B4353"
            onClick={() => history.push('/landlord/register')}
          />}
        />
      </div>

    </div>
  </Centered>)
}

export default LandlordLogin