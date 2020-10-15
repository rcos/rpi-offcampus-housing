import React from 'react'
import {useHistory} from 'react-router'

import Centered from '../components/toolbox/layout/Centered'
import Logo from '../components/Logo'
import Input from '../components/toolbox/form/Input'
import Button from '../components/toolbox/form/Button'
import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import {FiLogIn} from 'react-icons/fi'

const LandlordLogin = () => {

  const history = useHistory()

  return (<Centered width={400} height={500}>
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
          Landlord Login
        </div>
      </div>

      <div className="padded upper">
        <Input 
          label="email"
        />
      </div>
      <div className="padded upper">
        <Input 
          label="password"
          type="password"
        />
      </div>

      <div className="padded upper">
        <LeftAndRight
          left={<div style={{fontSize: '0.8rem'}}>Forgot password?</div>}
          right={<Button 
            text="Login"
            textColor="white"
            background="#E0777D"
            icon={<FiLogIn />}
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
            background="#1E2019"
            onClick={() => history.push('/landlord/register')}
          />}
        />
      </div>

    </div>
  </Centered>)
}

export default LandlordLogin