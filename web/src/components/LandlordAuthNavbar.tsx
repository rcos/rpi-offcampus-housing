import React, { useEffect } from 'react'

import LeftAndRight from './toolbox/layout/LeftAndRight'
import Logo from './Logo'

import {useSelector} from 'react-redux'
import _ from 'lodash'

interface ILandlordNavbar {
  showNavbar?: boolean
}

const LandlordNavbar = ({showNavbar}: ILandlordNavbar) => {

  const user = useSelector((state: any) => state.user)

  const getName = (): string => {

    if (!_.has(user, 'user')) return `undefined`
    return `${user.user.first_name} ${user.user.last_name}`
  }

  if (showNavbar != false) return (<React.Fragment>
    <div style={{marginTop: '20px'}}></div>
    <LeftAndRight 
      left={<div><Logo /></div>}
      right={<div className="nav-right-holder">
        <div><span style={{fontWeight: 'bold'}}>
        {getName ()}</span></div>
      </div>}
    />
    <div style={{marginTop: '20px'}}></div>
  </React.Fragment>)
  else return (<div></div>)
}

export default LandlordNavbar