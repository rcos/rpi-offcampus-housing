import React from 'react'

import Centered from '../components/toolbox/layout/Centered'
import Button from '../components/toolbox/form/Button'
import {BiLogIn} from 'react-icons/bi'

const StudentLoginView = () => {

  // const history = useHistory()

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
          window.location.replace("https://cas-auth.rpi.edu/cas/login?service=http%3A%2F%2Flocalhost%3A9010%2Fauth%2Frpi%2Fcas-auth")
        }}
      />
    </div>

  </Centered>)
}

export default StudentLoginView