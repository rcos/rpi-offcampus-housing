import React from 'react'
import {useHistory} from 'react-router-dom'

import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import ViewWrapper from '../components/ViewWrapper'
import Logo from '../components/Logo'
import Button from '../components/toolbox/form/Button'
import {BiLogIn} from 'react-icons/bi'

const SearchView = () => {

  return (<div>
    <ViewWrapper>

    <div>
      <div style={{height: `30px`}}></div>
      <LeftAndRight 
        left={<Logo />}
        right={<LandingAction />}
      />
    </div>
   

    </ViewWrapper>

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
        icon={<BiLogIn/>}
        background="#E0777D"
        textColor="white"
        iconLocation="right"
        onClick={() => history.push('/student/login')}
      />
    </div>

    <Button 
      text="Landlord Login"
      icon={<BiLogIn/>}
      background="#1E2019"
      textColor="white"
      iconLocation="right"
      onClick={() => history.push('/landlord/login')}
    />

  </div>)
}

export default SearchView