import React, { useEffect, useRef, useState } from 'react'

import Centered from '../components/toolbox/layout/Centered'
import Button from '../components/toolbox/form/Button'
import {BiLogIn} from 'react-icons/bi'
import {backendPath} from '../config'
import SuggestionInput from '../components/toolbox/form/SuggestionInput'
// @ts-ignore
import urlencode from 'urlencode'
import {BiBookAlt} from 'react-icons/bi'
import CommentBubble from '../components/toolbox/misc/CommentBubble'
import {objectURI} from '../API/S3API'
import { useGetInstitutionsLazyQuery, useGetInstitutionLazyQuery, GetInstitutionQuery } from '../API/queries/types/graphqlFragmentTypes'
import Cookies from 'universal-cookie'
import {motion, useSpring, useTransform} from 'framer-motion'

const StudentLoginView = () => {

  const cookies = new Cookies()

  const handleInstitutionLogin = (institution_name: string | null) => {
    console.log(`Clicked...`)
    let name_ = institution_name == null ? institutionName : institution_name

    console.log(`name: ${name_}`)
    switch (name_.toLowerCase()) {
      case 'rensselaer polytechnic institute':
      window.location.replace(getCASURL())
        break;

      default:
        setError({error: institutionName.length == 0 ? `No institution selected` : `Unrecognized institution: ${institutionName}`})
    }
  }

  const getCASURL = (): string => {
    // const urlencoded_ = `http://localhost:9010/auth/rpi/cas-auth` => http%3A%2F%2Flocalhost%3A9010%2Fauth%2Frpi%2Fcas-auth
    const urlencoded_ = urlencode(backendPath('/auth/rpi/cas-auth'))

    return `https://cas-auth.rpi.edu/cas/login?service=${urlencoded_}`
  }

  const [institutionName, setInstitutionName] = useState<string>("")
  const [lastInstitution, setLastInstitution] = useState<GetInstitutionQuery | null>(null)
  const [_error, setError] = useState<{error: string | null}>({error: null})
  const [matchedInstitutions, setMatchedInstitutions] = useState<string[]>([])
  const [getInstitions, {loading: institutionsLoading, data: institutionList}] = useGetInstitutionsLazyQuery()
  const [getInstitution, {loading: institutionLoading, data: institutionData}] = useGetInstitutionLazyQuery()

  const lastRef = useRef<HTMLDivElement>(null)
  const lastInstSpring = useSpring(0, {stiffness: 120})
  const lastOpacityTransform = useTransform(lastInstSpring, [0, 1], [0, 1])
  const lastHeightTransform = useTransform(lastInstSpring, (x: number) => {
    if (lastRef.current == null) return 0
    
    let bound_ = lastRef.current.getBoundingClientRect()
    return bound_.height * (1-x) * -1
  })

  useEffect(() => {

    // try to load the last institution saved...
    let last_institution_id = cookies.get('inst')
    if (typeof last_institution_id == typeof "") {
      getInstitution({variables: {id: last_institution_id}})
    }

  }, [])

  useEffect(() => {
    if (institutionData == null) lastInstSpring.set(0)
    else lastInstSpring.set(1)
  }, [institutionData])

  useEffect(() => {
    if (institutionData) {
      setLastInstitution(institutionData)
    }
  }, [institutionData])


  useEffect(() => {
    let matched_list: string[] = []
    if (institutionList && institutionList.getMatchingInstitutions.data) {
      matched_list = institutionList.getMatchingInstitutions.data.institutions.map((institution_) => {
        return institution_.name
      })
    }

    if (!institutionsLoading) setMatchedInstitutions(matched_list)
  }, [institutionList])

  const matchesName = (name: string, partial: string): boolean => {
    let k = 0;
    for (let i = 0; i < name.length; ++i) {
      if (partial[k] == name[i]) ++k;
    }

    return partial.length == k
  }

  return (<Centered width={400} height={lastInstitution == null? 300 : 500}>

    <div>

      <CommentBubble 
        message={_error.error ? _error.error : "No error"}
        show={_error.error != null}
        header="Error"
        color="red"
      />

      <div className="padded upper">
        <SuggestionInput 
          icon={<BiBookAlt />}
          label="Institution"
          onChange={(value: string) => {
            setInstitutionName(value)
          }}
          inferenceFn={(x: string): {[key: string]: string[];} => {
            setInstitutionName(x)
            if (x.length == 1 || (x.length > 0 && matchedInstitutions.length == 0)) {
              getInstitions({
                variables: {
                  partial_name: x
                }
              })
              return {
                ...(institutionData && institutionData.getInstitution.data ? {"recent": [
                  institutionData.getInstitution.data.name
                ]} : {})
              }
            }

            else {
              return {
                "institutions": (matchedInstitutions as string[]).filter((_name_: string) => matchesName(_name_.toLowerCase(), x.toLowerCase())),
                ...(institutionData && institutionData.getInstitution.data ? {"recent": [
                  institutionData.getInstitution.data.name
                ]} : {})
              }
            }
          }}
        />
      </div>
      <div className="padded upper" style={{minWidth: `100px`, width: `50%`, float: 'right'}}>
        <Button 
          text="Continue"
          icon={<BiLogIn/>}
          background="#E0777D"
          textColor="white"
          iconLocation="right"
          onClick={() => {
            handleInstitutionLogin(null)
          }}
        />
      </div>
    </div>

  </Centered>)
}

export default StudentLoginView