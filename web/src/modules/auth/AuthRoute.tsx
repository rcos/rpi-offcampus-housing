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

    console.log(`User:`)
    console.log(user)

  }, [user])

  return (<Route {...rest} render={(props) => {

    // if this route is set for any user level (no restriction)
    if (accessLevel == AccessLevels.ANY) return <Component {...props} />

    else if (auth.loaded) {
      // If I am authenticated, I can access components with accessLevel of authenticated user
      if (auth.isAuthenticated) {

        if (accessLevel == AccessLevels.UNAUTH) return <Redirect to="/home" />
        else if (accessLevel == AccessLevels.STUDENT
          || accessLevel == AccessLevels.LANDLORD
          || accessLevel == AccessLevels.STUDENT_AND_LANDLORD) return <Component {...props} />

      }
      else {

        if (accessLevel == AccessLevels.UNAUTH) return <Component {...props} />
        else return <Redirect to="/" />

      }
    }
    else return <div />
    
  }} 
  />)
}

export default AuthRoute