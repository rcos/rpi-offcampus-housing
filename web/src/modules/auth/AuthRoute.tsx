import React, { useEffect, useState } from 'react'
import {Route, Redirect} from 'react-router'
import AccessLevels from './accessLevels.json'
// import AuthAPI from '../../API/AuthAPI'
import Cookies from 'universal-cookie'

import _ from 'lodash'

// redux
import {fetchUser, setInstitution} from '../../redux/actions/user'
import {ReduxState} from '../../redux/reducers/all_reducers'
import {useDispatch, useSelector} from 'react-redux'
import {useGetInstitutionLazyQuery} from '../../API/queries/types/graphqlFragmentTypes'
import {Student, Landlord} from '../../API/queries/types/graphqlFragmentTypes'

interface IAuthStatus {
  isAuthenticated: boolean
  user: Student | Landlord | null
  loaded?: boolean
  type: string | null
}

const AuthRoute = ({component: Component, accessLevel, ...rest}: any) => {

  const cookie = new Cookies()

  const getUserType = (auth: IAuthStatus): number => {
    // auth.user != undefined && _.has(auth.user, 'type') && (auth.user as any).type == "landlord"
    if (auth.user === null) return AccessLevels.UNAUTH
    else if (auth.type) {
      if (auth.type === "landlord") {
        return AccessLevels.LANDLORD;
      }
      if (auth.type === "student") {
        return AccessLevels.STUDENT;
      }
    }
    return AccessLevels.UNAUTH
  }
  
  const defaultRoute = (user_type: number): string => {
    if (user_type === AccessLevels.STUDENT) return '/search'
    if (user_type === AccessLevels.LANDLORD) return '/landlord/dashboard'
    if (user_type === AccessLevels.UNAUTH) return '/'
    return '/'
  }

  const [auth, setAuth] = useState<IAuthStatus>({
    isAuthenticated: false,
    user: null,
    loaded: false,
    type: null
  })

  const dispatch = useDispatch()
  const user = useSelector((state: ReduxState) => state.user)
  const institution = useSelector((state: ReduxState) => state.institution)

  const [institutionId, setInstitutionId] = useState<string | null>(null)
  const [getInstitution, {data: instutionData, loading: institutionLoading, error}] = useGetInstitutionLazyQuery({variables: {id: institutionId == null ? "" : institutionId}})

  useEffect(() => {
    console.log(`AuthRoute loaded!`)
  }, [])

  useEffect(() => {

    // get the user if the user does not exist
    dispatch(fetchUser(user, {update: false}))

  }, [dispatch, user])

  useEffect(() => {

    // dispatch setInstitution
    if (!institutionLoading && instutionData && instutionData.getInstitution.data && instutionData.getInstitution.success) {
      console.log(`Calling dispatch setInstitution to: ${instutionData.getInstitution.data}`)
      dispatch(setInstitution(instutionData.getInstitution.data))
    }

  }, [institutionLoading])

  useEffect(() => {
    // only fetch the institution if we don't already have one saved
    if (institution == null && institutionId != null) {
      cookie.set('inst', institutionId, {path: '/'})
      getInstitution()
    }
  }, [institutionId])

  useEffect(() => {

    console.log(`AuthRoute: USER CHANGED`)
    console.log(user)

    setAuth({
      isAuthenticated: user == null ? false : user.authenticated,
      user: user == null ? null : user.user,
      loaded: user != null, 
      type: !user || !(user!.type) ? null : user!.type
    })

    // if this is a student, check the institution id
    if (user && user.type && user.type == "student") {
      if (user.user && user.user.auth_info && user.user.auth_info.institution_id) {
        let institution_id: string | null = user.user.auth_info.institution_id
        setInstitutionId(institution_id)
      }
    }
    

  }, [user])

  useEffect(() => {
    console.log(`Institution Data:`)
    console.log(institution)
  }, [institution])

  return (<Route {...rest} render={(props) => {

    // if this route is set for any user level (no restriction)
    if (accessLevel === AccessLevels.ANY) return <Component {...props} />

    else if (auth.loaded) {
      // If I am authenticated, I can access components with accessLevel of authenticated user
      if (auth.isAuthenticated) {

        if (accessLevel === AccessLevels.UNAUTH) return <Redirect to={defaultRoute(getUserType(auth))} />

        /*
        If we try to access a route only allowed to students, as a student, allow it.
        If we are not a student, redirect us to the landlord route
        */
        else if (accessLevel === AccessLevels.STUDENT) {
          if (auth.user !== null && auth.type && auth.type === "student") {
            return <Component {...props} />
          }
          else return <Redirect to={defaultRoute(getUserType(auth))} />
        }

        else if (accessLevel === AccessLevels.LANDLORD) {
          if (auth.user !== undefined && auth.type && auth.type === "landlord") {
            return <Component {...props} />
          }
          else return <Redirect to={defaultRoute(getUserType(auth))} />
        }

        else if (accessLevel === AccessLevels.STUDENT_AND_LANDLORD) {
          if (auth.user !== undefined && auth.type && 
          ( auth.type === "landlord" || auth.type === "student")) {
            return <Component {...props} />
          }
          else return <Redirect to={defaultRoute(getUserType(auth))} />
        }

        // default case
        else return <Component {...props} />

      }
      else {

        if (accessLevel === AccessLevels.UNAUTH) return <Component {...props} />
        else return <Redirect to={defaultRoute(getUserType(auth))} />

      }
    }
    else return <div />
    
  }} 
  />)
}

export default AuthRoute