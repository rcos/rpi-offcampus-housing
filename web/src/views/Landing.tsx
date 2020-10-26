import React from 'react'
import {useHistory} from 'react-router-dom'

import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import ViewWrapper from '../components/ViewWrapper'
import Logo from '../components/Logo'
import Button from '../components/toolbox/form/Button'
import {BiLogIn} from 'react-icons/bi'

const SearchView = () => {
  const history = useHistory()

  return (<div>
    <ViewWrapper>

    <div>
      <div style={{height: `30px`}}></div>
      <LeftAndRight 
        left={<Logo />}
        // sideright={<Button 
        //   text="Student"
        //   icon={<BiLogIn/>}
        //   background="#1E2019"
        //   textColor="white"
        //   iconLocation="right"
        //   onClick={() => history.push('/student/login')}
        // />}
        right={<div>
          <Button 
          text="Student"
          icon={<BiLogIn/>}
          background="#1E2019"
          textColor="white"
          iconLocation="right"
          onClick={() => history.push('/student/login')}
          />
          <br/>
          <Button 
          text="Landlord"
          icon={<BiLogIn/>}
          background="#1E2019"
          textColor="white"
          iconLocation="right"
          onClick={() => history.push('/landlord/login')}
          />
        </div>}
       
       
      />
    </div>
   

    </ViewWrapper>

  </div>)
}

export default SearchView