import React, { useEffect, useState } from 'react'
import {Route, Redirect} from 'react-router'
import AccessLevels from './accessLevels.json'
import AuthAPI from '../../API/AuthAPI'

import _ from 'lodash'

// redux
import {getUser, fetchUser} from '../../redux/actions/user'
import {useDispatch, useSelector} from 'react-redux'

interface IAuthStatus {
  isAuthenticated: boolean
  user: Object | undefined
  loaded?: boolean
}

const AuthRoute = ({component: Component, accessLevel, ...rest}: any) => {

  const [auth, setAuth] = useState<IAuthStatus>({
    isAuthenticated: false,
    user: undefined,
    loaded: false
  })

  const dispatch = useDispatch()
  const user = useSelector((state: any) => state.user)

  useEffect(() => {
    // get the user if the user does not exist
    dispatch(fetchUser(user, {update: false}))

  }, [])

  useEffect(() => {

    setAuth({
      isAuthenticated: 
        _.has(user, 'authenticated') ? user.authenticated : false,
      user: 
        _.has(user, 'user') ? user.user : null,
      loaded: 
      user == null ? false : true
    })
  }, [user])

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