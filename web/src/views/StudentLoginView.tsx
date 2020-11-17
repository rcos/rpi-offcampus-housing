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
import {imageURI} from '../API/S3API'
import { useGetInstitutionsLazyQuery, useGetInstitutionLazyQuery, GetInstitutionQuery } from '../API/queries/types/graphqlFragmentTypes'
import Cookies from 'universal-cookie'
import {motion, useSpring, useTransform} from 'framer-motion'

const StudentLoginView = () => {

  const cookies = new Cookies()

  const handleInstitutionLogin = (institution_name: string | null) => {
    let name_ = institution_name == null ? partialInstitutioName : institution_name
    switch (name_) {
      case 'Rensselaer Polytechnic Institute':
      window.location.replace(getCASURL())
        break;

      default:
        setError({error: partialInstitutioName.length == 0 ? `No institution selected` : `Unrecognized institution: ${partialInstitutioName}`})
    }
  }

  const getCASURL = (): string => {
    // const urlencoded_ = `http://localhost:9010/auth/rpi/cas-auth` => http%3A%2F%2Flocalhost%3A9010%2Fauth%2Frpi%2Fcas-auth
    const urlencoded_ = urlencode(backendPath('/auth/rpi/cas-auth'))

    return `https://cas-auth.rpi.edu/cas/login?service=${urlencoded_}`
  }

  const [lastInstitution, setLastInstitution] = useState<GetInstitutionQuery | null>(null)
  const [_error, setError] = useState<{error: string | null}>({error: null})
  const [partialInstitutioName, setPartialInstitutioName] = useState<string>("")
  const [matchedInstitutions, setMatchedInstitutions] = useState<string[]>([])
  const [getInstitions, {loading: institutionsLoading, data: institutionList}] = useGetInstitutionsLazyQuery({
    variables: {partial_name: partialInstitutioName}
  })
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
    if (partialInstitutioName != "") getInstitions()
  }, [partialInstitutioName])

  useEffect(() => {
    let matched_list: string[] = []
    if (institutionList && institutionList.getMatchingInstitutions.data) {
      matched_list = institutionList.getMatchingInstitutions.data.institutions.map((institution_) => {
        return institution_.name
      })
    }

    if (!institutionsLoading) setMatchedInstitutions(matched_list)
  }, [institutionList])

  return (<Centered width={400} height={lastInstitution == null? 300 : 500}>

    <div>

      <motion.div 
        ref={lastRef}
        style={{
          opacity: lastOpacityTransform,
          marginTop: lastHeightTransform
        }}
        className="previous-logged-in-institution">
        <div className="left-side">
          <div className="image-holder">
            <img 
              src={lastInstitution != null 
                && lastInstitution!.getInstitution.data 
                && lastInstitution!.getInstitution.success
                && lastInstitution!.getInstitution.data!.s3_thumb_key ? imageURI(lastInstitution!.getInstitution.data!.s3_thumb_key as string) : ""}
              width="100%"
              height="100%"
            />
          </div>
        </div>
        <div className="right-side">
        <div className="title">{lastInstitution == null ? "" : lastInstitution.getInstitution.data!.name}</div>
          <div className="button-area">
            <Button 
              text="Continue"
              icon={<BiLogIn/>}
              background="#E0777D"
              textColor="white"
              iconLocation="right"
              onClick={() => {
                handleInstitutionLogin(lastInstitution == null ? null : lastInstitution.getInstitution.data!.name)
              }}
            />
          </div>
        </div>

        <motion.div className="or-separator" style={{opacity: lastOpacityTransform}}>
          
        </motion.div>
      </motion.div>

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
          selectOnClick={true}
          suggestedList={matchedInstitutions}
          onChange={(x: string) => {
            setPartialInstitutioName(x)
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