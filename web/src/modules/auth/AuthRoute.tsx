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
        let level_ = AccessLevels.STUDENT;
        if (auth.user && (auth.user as Student).elevated_privileges ) {
          let privileges = (auth.user as Student).elevated_privileges!
          for (let i = 0; i < privileges.length; ++i) {
            switch (privileges[i]) {
              case "ownership_reviewer":
                level_ = level_ | AccessLevels.OWNERSHIP_REVIEWER
            }
          }
        }

        return level_
      }
    }
    return AccessLevels.UNAUTH
  }
  
  const defaultRoute = (user_type: number): string => {
    if ((user_type & AccessLevels.STUDENT) != 0) return '/search'
    if ((user_type & AccessLevels.LANDLORD) != 0) return '/landlord/dashboard'
    if ((user_type & AccessLevels.UNAUTH) != 0) return '/'
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

    // get the user if the user does not exist
    dispatch(fetchUser(user, {update: false}))

  }, [dispatch, user])

  useEffect(() => {

    // dispatch setInstitution
    if (!institutionLoading && instutionData && instutionData.getInstitution.data && instutionData.getInstitution.success) {
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

  const hasAccess = (access_flag: number): boolean => ( accessLevel & access_flag ) != 0

  /**
   * @desc Given the access parameters of the route in accessLevel,
   * determine based on the value of getUserType, whether the user has
   * all the possible permissions to access this page
   */
  const canAccess = (): boolean => {
    let user_perm_flags = getUserType(auth)
    return (accessLevel & user_perm_flags) != 0
  }

  return (<Route {...rest} render={(props) => {

    // if this route is set for any user level (no restriction)
    if (accessLevel === AccessLevels.ANY) return <Component {...props} />

    else if (auth.loaded) {
      // If I am authenticated, I can access components with accessLevel of authenticated user
      if (auth.isAuthenticated) {

        
        if (canAccess()) {
          return <Component {...props} />
        }
        else return (<Redirect to={defaultRoute(getUserType(auth))} />);

      }
      else {

        if (hasAccess(AccessLevels.UNAUTH)) return <Component {...props} />
        else return <Redirect to={defaultRoute(getUserType(auth))} />

      }
    }
    else return <div />
    
  }} 
  />)
}

export default AuthRoute