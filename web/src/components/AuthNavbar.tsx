import React, { useEffect } from 'react'

import LeftAndRight from './toolbox/layout/LeftAndRight'
import Logo from './Logo'

import {useSelector} from 'react-redux'
import _ from 'lodash'
import {useHistory} from 'react-router'

const Navbar = () => {

  const history = useHistory()
  const user = useSelector((state: any) => state.user)

  useEffect(() => {
    if (user != null) {
      if (!_.has(user.user, 'first_name')) history.push('/student/register/complete')
      if (!_.has(user.user, 'last_name')) history.push('/student/register/complete')
      if (!_.has(user.user, 'email')) history.push('/student/register/complete')
    }
  }, [user])

  const getName = (): string => {

    if (!_.has(user, 'user')) return `undefined`
    return `${user.user.first_name} ${user.user.last_name}`
  }

  return (<React.Fragment>
    <div style={{marginTop: '20px'}}></div>
    <LeftAndRight 
      left={<div><Logo /></div>}
      right={<div className="nav-right-holder">
        <div><span style={{fontWeight: 'bold'}}>
        {getName ()}</span> @ <span className="dashed-underline">Rensselaer Polytechnic Institute</span></div>
        <div className="school-logo-area"></div>
      </div>}
    />
    <div style={{marginTop: '20px'}}></div>
  </React.Fragment>)
}

export default Navbar