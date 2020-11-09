import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'

import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import Logo from '../components/Logo'
import Button from '../components/toolbox/form/Button'
import {BiLogIn} from 'react-icons/bi'
import Centered from '../components/toolbox/layout/Centered'
import {useMediaQuery} from 'react-responsive'

const SearchView = () => {

  const [centeredWidth, setCenteredWidth] = useState<number>(1400)

  const calcCenterdWidth = (win_width: number) => {
    if (win_width > 1400) setCenteredWidth(1400)
    else if (win_width > 1200) setCenteredWidth(1200)
    else if (win_width > 1000) setCenteredWidth(1000)
    else if (win_width > 800) setCenteredWidth(800)
  }

  useEffect(() => {
    calcCenterdWidth(window.innerWidth)
    const resizeFn = (e: any) => {
      let w = e.target.innerWidth
      calcCenterdWidth(w)
    }

    window.addEventListener('resize', resizeFn)

    return () => {
      window.removeEventListener('resize', resizeFn)
    }
  }, [])

  return (<div>
    
    <Centered width={centeredWidth} height="100%">
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