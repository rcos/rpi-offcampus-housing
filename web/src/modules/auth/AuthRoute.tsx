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

  const getUserType = (user_type: any): number => {
    // auth.user != undefined && _.has(auth.user, 'type') && (auth.user as any).type == "landlord"
    if (auth.user == undefined) return AccessLevels.UNAUTH
    else if (_.has(auth.user, 'type')) {
      if ((auth.user as any).type == "landlord") return AccessLevels.LANDLORD
      if ((auth.user as any).type == "student") return AccessLevels.STUDENT
    }
    return AccessLevels.UNAUTH
  }
  const defaultRoute = (user_type: number): string => {
    if (user_type == AccessLevels.STUDENT) return '/search'
    if (user_type == AccessLevels.LANDLORD) return '/landlord/dashboard'
    if (user_type == AccessLevels.UNAUTH) return '/'
    return '/'
  }

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

    // if this route is set for any user level (no restriction)
    if (accessLevel == AccessLevels.ANY) return <Component {...props} />

    else if (auth.loaded) {
      // If I am authenticated, I can access components with accessLevel of authenticated user
      if (auth.isAuthenticated) {

        if (accessLevel == AccessLevels.UNAUTH) return <Redirect to={defaultRoute(getUserType(auth))} />

        /*
        If we try to access a route only allowed to students, as a student, allow it.
        If we are not a student, redirect us to the landlord route
        */
        else if (accessLevel == AccessLevels.STUDENT) {
          if (auth.user != undefined && _.has(auth.user, 'type') && (auth.user as any).type == "student") {
            return <Component {...props} />
          }
          else return <Redirect to={defaultRoute(getUserType(auth))} />
        }

        else if (accessLevel == AccessLevels.LANDLORD) {
          if (auth.user != undefined && _.has(auth.user, 'type') && (auth.user as any).type == "landlord") {
            return <Component {...props} />
          }
          else return <Redirect to={defaultRoute(getUserType(auth))} />
        }

        else if (accessLevel == AccessLevels.STUDENT_AND_LANDLORD) {
          if (auth.user != undefined && _.has(auth.user, 'type') && 
          ((auth.user as any).type == "landlord" || (auth.user as any).type == "student")) {
            return <Component {...props} />
          }
          else return <Redirect to={defaultRoute(getUserType(auth))} />
        }

        // default case
        else return <Component {...props} />

      }
      else {

        if (accessLevel == AccessLevels.UNAUTH) return <Component {...props} />
        else return <Redirect to={defaultRoute(getUserType(auth))} />

      }
    }
    else return <div />
    
  }} 
  />)
}

export default AuthRoute