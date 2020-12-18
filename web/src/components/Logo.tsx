import React from 'react'
import {useHistory} from 'react-router'

interface LogoInterface {
  width?: number
  height?: number
  withText?: boolean
  withBeta?: boolean
}

const Logo = ({width, withBeta, withText, height}: LogoInterface) => {

  const history = useHistory()

  return (<React.Fragment>
    <div className="app-logo" style={{
      width: `${width? width: 40}px`,
      height: `${height? height: 40}px`
      }}
      onClick={() => history.push('/')}
    />
    {withText == true && <div 
      style={{
        height: `${height ? height : 40}px`
      }}
      className="app-logo-text no-select">offcmpus{withBeta && <div className="beta-tag">Beta</div>}</div>}
  </React.Fragment>)
}

export const FloatingLogo = () => {

  return(<div style={{
    position: 'absolute',
    top: '20px',
    left: '0px'
}}><Logo /></div>)
}

export default Logo