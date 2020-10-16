import React from 'react'

// Loading Animation
const Loading = () => {

  return (<div style={{
    boxSizing: `border-box`,
    width: `100%`,
    height: '100%',
    position: `absolute`,
    left: 0,
    top: 0
  }}>
    <div
      style={{
        width: `80px`, height: `80px`,
        margin: `0 auto`
      }}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          transform: `translateY(-50%)`
        }}>
          <div className="lds-ripple"><div></div><div></div></div>
        </div>
    </div>
  </div>)
}

export default Loading