import React from 'react'
import {useHistory} from 'react-router'

import Centered from '../components/toolbox/layout/Centered'
import Button from '../components/toolbox/form/Button'
import {BiLogIn} from 'react-icons/bi'

const StudentLoginView = () => {

  const history = useHistory()

  return (<Centered width={400} height={300}>

    <div>
      TEMP: TODO Replace with DropdownSelector
      <Button 
        text="RPI Login"
        icon={<BiLogIn/>}
        background="#E0777D"
        textColor="white"
        iconLocation="right"
        onClick={() => {
          window.location.replace("https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A3000%2Fstudent%2Fauth-cas")
        }}
      />
    </div>

  </Centered>)
}

export default StudentLoginView