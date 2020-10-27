import React, { useEffect, useState } from 'react'
import {Route, Redirect} from 'react-router'
import AccessLevels from './accessLevels.json'
import AuthAPI from '../../API/AuthAPI'

interface IAuthStatus {
  isAuthenticated: boolean
  user: Object | undefined
  loaded?: boolean
}


const Auth = {
  status: (accessLevel: number): Promise<IAuthStatus> => {
    return AuthAPI.status()
    .then(res => {

      console.log("AUTH STATUS")
      console.log(res)
      console.log(res.data.authenticated)

      return {
        user: undefined,
        isAuthenticated: res.data.authenticated
      }

    })
    .catch(() => {
      console.log(`AUTH ERROR`)
      return {
        user: undefined,
        isAuthenticated: false
      }
    })
  }
}

const AuthRoute = ({component: Component, accessLevel, ...rest}: any) => {

  const [auth, setAuth] = useState<IAuthStatus>({
    isAuthenticated: false,
    user: undefined,
    loaded: false
  })

  useEffect(() => {

    Auth.status(accessLevel)
    .then(res => {
      setAuth({...res, loaded: true})
    })
    .catch(err => {
      setAuth({...err, loaded: false})
    })

  }, [])

  return (<Route {...rest} render={(props) => {
    if (auth.loaded) {
      if (auth.isAuthenticated) return <Component {...props} />
      else return <Redirect to="/" />
    }
    else return <div />
    
  }} 
  />)
}

export default AuthRoute