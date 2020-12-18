import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'

import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import Logo from '../components/Logo'
import Button from '../components/toolbox/form/Button'
import DropdownButton from '../components/toolbox/form/DropdownButton'
import Centered from '../components/toolbox/layout/Centered'
import Toggle2 from '../components/toolbox/form/Toggle2'

const LandingPage = () => {

  return (<div>
    
    <Centered horizontalBuffer={400} height="100%">
      <React.Fragment>

        {/* Header */}
        <div style={{marginTop: `20px`}}></div>
        <LeftAndRight 
          left={<Logo withText={true} withBeta={true} />}
          right={<LandingAction />}
        />

        {/* Selection Area for Landlord / Student */}
        <div style={{
          width: `40px`,
          margin: `10px auto`
        }}>
          <Toggle2 
            on_label="I am a Student"
            off_label="I am a Landlord"
            onToggle={(val: boolean, option: string) => {
              console.log(val, option)
            }}
          />
        </div>

      </React.Fragment>
    </Centered>

  </div>)
}

const LandingAction = () => {

  const history = useHistory()

  return (<div style={{
    display: 'flex'
  }}>
    
    <span style={{marginRight: `8px`}}>
      <DropdownButton 
        text="Register"
        textColor="white"
        background="#3B4353"
        options={[
          {option: "Student", onClick: () => history.push('/student/login')},
          {option: "Landlord", onClick: () => history.push('/landlord/register')}
        ]}
      />
    </span>
    <DropdownButton 
      text="Login"
      textColor="white"
      background="#E0777D"
      options={[
        {option: "Student", onClick: () => history.push('/student/login')},
        {option: "Landlord", onClick: () => history.push('/landlord/login')}
      ]}
    />
    {/* <div style={{marginRight: '10px'}}>
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
    /> */}

  </div>)
}

export default LandingPage