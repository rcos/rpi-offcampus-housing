import React from 'react'
import Centered from '../components/toolbox/layout/Centered'
import Logo from '../components/Logo'

const NoInternetConnection = () => {

    return (<Centered width="180" height="200">
        <div>

            <div style={{
                paddingBottom: `30px`,
                width: `40px`,
                margin: `0 auto`,
                transform: `scale(3)`
            }}>
                <Logo/>
            </div>

            <div
                style={{
                    fontFamily: `sans-serif, Arial`,
                    fontWeight: 600,
                    fontSize: `1.2rem`,
                    textAlign: `center`,
                    color: '#3B4353'
                }}
            >
                Slow Connection

                <div style={{
                    height: `4px`,
                    borderRadius: `3px`,
                    backgroundColor: `#E1E6EA`,
                    marginTop: `10px`,
                    position: `relative`,
                    overflow: `hidden`
                }}>
                    <div className="mini-loading-slider" />
                </div>
            </div>

        </div>
    </Centered>)
}

export default NoInternetConnection;