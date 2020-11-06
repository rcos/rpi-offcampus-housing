import React from 'react'
import {useHistory} from 'react-router-dom'

import ViewWrapper from '../components/ViewWrapper'
import Button from '../components/toolbox/form/Button'

import { FiHome } from "react-icons/fi"

const NotFound = () => {
  const history = useHistory()
  
  const goHome = () => history.push('/')

  return (<ViewWrapper>
    <div>
      <div
      style={{
        fontWeight: 600,
        fontSize: '8rem',
        textAlign: 'center',
        marginTop: '200px',
        color: `rgba(0, 0, 0, 0.4)`
      }}>
        404
      </div>
      <div
      style={{
        textAlign: 'center',
        fontSize: `1.5rem`
      }}
      >
        Page Not Found
        <div style={{
          width: '120px',
          margin: '0 auto',
          marginTop: '10px',
          fontSize: `0.8rem`
        }}>
          <Button 
            text="Go Home"
            icon={<FiHome />}
            textColor="white"
            onClick={goHome}
          />
        </div>
      </div>
    </div>
  </ViewWrapper>)
}

export default NotFound