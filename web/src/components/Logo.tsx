import React from 'react'
import {useHistory} from 'react-router'

interface LogoInterface {
  width?: number
  height?: number
}

const Logo = ({width, height}: LogoInterface) => {

  const history = useHistory()

  return (<div className="app-logo" style={{
    width: `${width? width: 40}px`,
    height: `${height? height: 40}px`
    }}
    onClick={() => history.push('/')}
  ></div>)
}

export const FloatingLogo = () => {

  return(<div style={{
    position: 'absolute',
    top: '20px',
    left: '0px'
}}><Logo /></div>)
}

export default Logo