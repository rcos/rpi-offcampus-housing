import React from 'react'
import {useHistory} from 'react-router'

import Centered from '../components/toolbox/layout/Centered'
import Logo from '../components/Logo'
import Input from '../components/toolbox/form/Input'
import Button from '../components/toolbox/form/Button'
import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import {FiLogIn} from 'react-icons/fi'

const StudentRegister = () => {

  const history = useHistory()

  return (<Centered width={400} height={600}>
    <div>

      {/* Header */}
      <div style={{display: 'flex'}}>
        <div style={{width: '40px', height: '40px'}}>
          <Logo />
        </div>
        <div style={{
          fontWeight: 600,
          fontSize: '1rem',
          lineHeight: '45px',
          marginLeft: '10px'
        }}>
          Student Register
        </div>
      </div>

      <div className="padded upper">
        <Input 
          label="First Name"
        />
      </div>
      <div className="padded upper">
        <Input 
          label="Last Name"
        />
      </div>

      <div style={{marginTop: '40px'}} />
      <div className="padded upper">
        <Input 
          label=".edu email"
        />
      </div>

      <div className="padded upper">
        <Input 
          label="confirm your .edu email"
        />
      </div>

      <div style={{marginTop: '40px'}} />
      <div className="padded upper">
        <Input 
          label="password"
          type="password"
        />
      </div>

      <div className="padded upper">
        <Input 
          label="confirm password"
          type="password"
        />
      </div>

      <div className="padded upper">
        <LeftAndRight
          left={<div style={{fontSize: '0.8rem'}}>Forgot password?</div>}
          right={<Button 
            text="Continue"
            textColor="white"
            background="#E0777D"
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
            text="Login"
            textColor="white"
            background="#1E2019"
            icon={<FiLogIn />}
            iconLocation="right"
            onClick={() => history.push('/landlord/login')}
          />}
        />
      </div>

    </div>
  </Centered>)
}

export default StudentRegister