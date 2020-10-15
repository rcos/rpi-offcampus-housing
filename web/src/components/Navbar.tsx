import React from 'react'

import LeftAndRight from './toolbox/layout/LeftAndRight'
import Logo from './Logo'

const Navbar = () => {

  return (<React.Fragment>
    <div style={{marginTop: '20px'}}></div>
    <LeftAndRight 
      left={<div><Logo /></div>}
      right={<div className="nav-right-holder">
        <div><span style={{fontWeight: 'bold'}}>James Bond</span> @ 
        <span className="dashed-underline">Rensselaer Polytechnic Institute</span></div>
        <div className="school-logo-area"></div>
      </div>}
    />
    <div style={{marginTop: '20px'}}></div>
  </React.Fragment>)
}

export default Navbar