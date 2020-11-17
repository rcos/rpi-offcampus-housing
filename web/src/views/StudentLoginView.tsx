import React, { useEffect, useState } from 'react'

import Centered from '../components/toolbox/layout/Centered'
import Button from '../components/toolbox/form/Button'
import {BiLogIn, BiReplyAll} from 'react-icons/bi'
import {backendPath} from '../config'
import SuggestionInput from '../components/toolbox/form/SuggestionInput'
// @ts-ignore
import urlencode from 'urlencode'
import {BiBookAlt} from 'react-icons/bi'
import CommentBubble from '../components/toolbox/misc/CommentBubble'
import { useGetInstitutionsLazyQuery } from '../API/queries/types/graphqlFragmentTypes'

const StudentLoginView = () => {

  const handleInstitutionLogin = () => {
    switch (partialInstitutioName) {
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

  const [_error, setError] = useState<{error: string | null}>({error: null})
  const [partialInstitutioName, setPartialInstitutioName] = useState<string>("")
  const [matchedInstitutions, setMatchedInstitutions] = useState<string[]>([])
  const [getInstitions, {loading: institutionsLoading, data: institutionList}] = useGetInstitutionsLazyQuery({
    variables: {partial_name: partialInstitutioName}
  })

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

  return (<Centered width={400} height={300}>

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
            handleInstitutionLogin()
          }}
        />
      </div>
    </div>

  </Centered>)
}

export default StudentLoginView