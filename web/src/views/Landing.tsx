import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'

import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import Logo from '../components/Logo'
import Button from '../components/toolbox/form/Button'
import Centered from '../components/toolbox/layout/Centered'

const LandingPage = () => {

  return (<div>
    
    <Centered horizontalBuffer={400} height="100%">
      <React.Fragment>

        <div style={{marginTop: `20px`}}></div>
        <LeftAndRight 
            left={<Logo />}
            right={<LandingAction />}
          />

      </React.Fragment>
    </Centered>

  </div>)
}

const LandingAction = () => {

  const history = useHistory()

  return (<div style={{
    display: 'flex'
  }}>
    
    <div style={{marginRight: '10px'}}>
      <Button 
        text="Student Login"
        background="#96b5b1"
        textColor="white"
        iconLocation="right"
        onClick={() => history.push('/student/login')}
      />
    </div>

    <Button 
      text="Landlord Login"
      background="#3B4353"
      textColor="white"
      iconLocation="right"
      onClick={() => history.push('/landlord/login')}
    />

  </div>)
}

export default LandingPage