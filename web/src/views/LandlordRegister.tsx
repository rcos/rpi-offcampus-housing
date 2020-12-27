import React, { useState, useEffect } from 'react'
import {useHistory} from 'react-router'
import {useMediaQuery} from 'react-responsive'

import Centered from '../components/toolbox/layout/Centered'
import Logo from '../components/Logo'
import Input from '../components/toolbox/form/Input'
import Button from '../components/toolbox/form/Button'
import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import {useCreateLandlordMutation} from '../API/queries/types/graphqlFragmentTypes'
import Error from '../components/toolbox/form/Error'
import LandlordAPI from '../API/LandlordAPI'

import {useDispatch, useSelector} from 'react-redux'
import {fetchUser} from '../redux/actions/user'

interface IFormError {
  message: string
  hasError: boolean
}

interface IRegisterFields {
  first_name: string
  last_name: string
  email: string
  confirm_email: string
  password: string
  confirm_password: string
}

const LandlordRegister = () => {

  const dispatch = useDispatch()
  const user = useSelector((state: any) => state.user)
  const [createLandlord, {data: landlordCreationResponse, loading: createLandlordLoading}] = useCreateLandlordMutation()
  const isMobile = useMediaQuery({ query: '(max-width: 500px)' })
  const isSmallScreen = useMediaQuery({ query: '(max-width: 800px)'})
  const history = useHistory()
  const [formError, setFormError] = useState<IFormError>({
    message: '', hasError: false
  })
  const [registerFields, setRegisterFields] = useState<IRegisterFields>({
    first_name: '', last_name: '', email: '', confirm_email: '',
    password: '', confirm_password: ''
  })

  useEffect(() => {

    if (landlordCreationResponse) {

      if (landlordCreationResponse.createLandlord.success) {
        // history.push('/')
        // log user in after registering
        LandlordAPI.login(
          registerFields.email,/* email */
          registerFields.password/* password */
        )
        .then(res => {
          if (res.data.success) { 
            dispatch(fetchUser(user, {update: true}))
          }
        })
      }
      else if (landlordCreationResponse.createLandlord.error) {
        setFormError({
          hasError: true,
          message: landlordCreationResponse.createLandlord.error
        })
      }
      else {
        setFormError({
          hasError: true,
          message: "Error processing registration"
        })
      }

    }

  }, [landlordCreationResponse])

  useEffect(() => {

    const submitOnEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter") handleRegistrationCompletion()
    }

    window.addEventListener('keypress', submitOnEnter)
    
    return () => {
      window.removeEventListener('keypress', submitOnEnter)
    }
  }, [])

  const clearError = () => { setFormError({hasError: false, message: ''}) }

  const fieldUpdateFunction = (field_name: string): ((arg0: string) => void) => {
    let fields_ : string[] = ['first_name', 'last_name', 'email', 'confirm_email', 'password', 'confirm_password']
    if (!fields_.includes(field_name)) {
      console.log(`${field_name} is an invalid register from field name`)
      return () => {}
    }
    // return a function that updates the field with field_name
    return (updated_value: string) => {
      let new_form_value: any = registerFields;
      (new_form_value[field_name] as any) = updated_value;
      setRegisterFields(new_form_value as IRegisterFields)
    }
  }

  const handleRegistrationCompletion = () => {
    let error_fields = Object.keys(registerFields).filter(key_ => (registerFields as any)[key_].length === 0)
    if (error_fields.length > 0) {
      setFormError({
        message: "Some of the fields are empty",
        hasError: true
      })
    }
    else {

      if (registerFields.confirm_email !== registerFields.email) {
        setFormError({
          hasError: true,
          message: "Emails must match"
        })
      }
      else if (registerFields.confirm_password !== registerFields.password) {
        setFormError({
          hasError: true,
          message: "Passwords must match"
        })
      }

      else {
        // submit the form!
        setFormError({
          hasError: false,
          message: ''
        })
        
        createLandlord({
          variables: {
            first_name: registerFields.first_name,
            last_name: registerFields.last_name,
            email: registerFields.email,
            password: registerFields.password
          }
        })
      }

    }
  }

  return (<Centered width={isMobile ? 300 : 400} height={600}>
    <div>{!createLandlordLoading && !landlordCreationResponse && <div>

      {/* Header */}
      <div style={{display: 'flex'}} className="padded upper">
        <div style={{width: '40px', height: '40px'}}>
          <Logo />
        </div>
        <div style={{
          fontWeight: 600,
          fontSize: '1rem',
          lineHeight: '45px',
          marginLeft: '10px'
        }}>
          Landlord Register
        </div>
      </div>

      {/* Error area */}
      {formError.hasError && 
      <Error 
        type="error"
        message={formError.message}
      />}

      <div className="padded upper">
        <Input 
          label="First Name"
          onChange={fieldUpdateFunction('first_name')}
        />
      </div>
      <div className="padded upper">
        <Input 
          label="Last Name"
          onChange={fieldUpdateFunction('last_name')}
        />
      </div>

      <div style={{marginTop: '40px'}} />
      <div className="padded upper">
        <Input 
          label="email"
          onChange={fieldUpdateFunction('email')}
        />
      </div>

      <div className="padded upper">
        <Input 
          label="confirm email"
          onChange={fieldUpdateFunction('confirm_email')}
        />
      </div>

      <div style={{marginTop: '40px'}} />
      <div className="padded upper">
        <Input 
          label="password"
          type="password"
          onChange={fieldUpdateFunction('password')}
        />
      </div>

      <div className="padded upper">
        <Input 
          label="confirm password"
          type="password"
          onChange={fieldUpdateFunction('confirm_password')}
        />
      </div>

      <div className="padded upper">
        <LeftAndRight
          left={<div></div>}
          right={<Button 
            bold={true}
            large={isSmallScreen}
            text="Complete"
            textColor="white"
            background="#E0777D"
            iconLocation="right"
            onClick={handleRegistrationCompletion}
          />}
        />
      </div>      

      {/* Horizontal Line */}
      <div className="padded upper">
        <div className="horizontal-line">
          <div className="label"></div>
        </div>
      </div>

      <div className="padded upper">
        <LeftAndRight 
          left={<div style={{fontSize: '0.8rem'}}>
            Already have an account?
          </div>}
          right={<Button 
            bold={true}
            large={isSmallScreen}
            text="Login"
            textColor="white"
            background="#3B4353"
            iconLocation="right"
            onClick={() => history.push('/landlord/login')}
          />}
        />
      </div>

    </div>}</div>
  </Centered>)
}

export default LandlordRegister