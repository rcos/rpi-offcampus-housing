import React from 'react'

import Centered from '../components/toolbox/layout/Centered'
import Button from '../components/toolbox/form/Button'
import {BiLogIn} from 'react-icons/bi'
import {backendPath} from '../config'
// @ts-ignore
import urlencode from 'urlencode'

const StudentLoginView = () => {

  const getCASURL = (): string => {
    // const urlencoded_ = `http://localhost:9010/auth/rpi/cas-auth` => http%3A%2F%2Flocalhost%3A9010%2Fauth%2Frpi%2Fcas-auth
    const urlencoded_ = urlencode(backendPath('/auth/rpi/cas-auth'))

    return `https://cas-auth.rpi.edu/cas/login?service=${urlencoded_}`
  }

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
          window.location.replace(getCASURL())
        }}
      />
    </div>

  </Centered>)
}

export default StudentLoginView