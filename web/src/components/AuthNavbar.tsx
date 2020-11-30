import React, { useEffect } from 'react'

import {objectURI} from '../API/S3API'
import LeftAndRight from './toolbox/layout/LeftAndRight'
import Logo from './Logo'

import {RiAtLine} from 'react-icons/ri'
import {useSelector} from 'react-redux'
import _ from 'lodash'
import {useHistory} from 'react-router'

const Navbar = ({showNavbar}:{showNavbar?:boolean}) => {

  const history = useHistory()
  const user = useSelector((state: any) => state.user)
  const institution = useSelector((state: any) => state.institution)

  useEffect(() => {
    if (user != null) {
      if (!_.has(user.user, 'first_name')) history.push('/student/register/complete')
      if (!_.has(user.user, 'last_name')) history.push('/student/register/complete')
      if (!_.has(user.user, 'email')) history.push('/student/register/complete')
    }
  }, [user, history])

  const getName = (): string => {

    if (!_.has(user, 'user')) return ``
    return `${user.user.first_name} ${user.user.last_name}`
  }

  const getInstitution = (): string => {
    if (institution == null || !_.has(institution, 'name')) return ''
    return institution.name
  }

  const getSchoolThumbSource = (): string => {
    if (institution == null) return '';
    return objectURI(institution.s3_thumb_key)
  }

  return (<React.Fragment>
    <div style={{marginTop: '20px'}}></div>
    <LeftAndRight 
      left={<div><Logo /></div>}
      right={showNavbar != false ? <div className="nav-right-holder">
        <div><span style={{fontWeight: 'bold'}}>
  {getName ()}</span> 
    <span style={{
      position: 'relative',
      top: '4px',
      margin: '0 3px'
    }}><RiAtLine /></span> 
    <span className="dashed-underline">{getInstitution()}</span></div>
        <div className="school-logo-area">
          <img
            src={getSchoolThumbSource()}
            width="100%"
            height="100%"
          />
        </div>
      </div> : <div></div>}
    />
    <div style={{marginTop: '20px'}}></div>
  </React.Fragment>)
}

export default Navbar