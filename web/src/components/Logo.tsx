import React from 'react'

interface LogoInterface {
  width?: number
  height?: number
}

const Logo = ({width, height}: LogoInterface) => {

  return (<div className="app-logo" style={{
    width: `${width? width: 40}px`,
    height: `${height? height: 40}px`
  }}></div>)
}

export default Logo