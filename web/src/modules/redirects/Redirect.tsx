import React, { useEffect } from 'react'
import {useHistory} from 'react-router'
import _ from 'lodash'
/* 
Redirect Module's purpose is to process a function and based on the result,
moves to a new route

2 possible use cases:
  1: We want to redirect based on 2 responses -> success / failure
      In this case, we provide a success url: onSuccess, and a failure
      url: onError. The process function is expected to return a boolean
      and if true, redirects to 'onSuccess' and if failure, redirects to
      'onError'

  2: We have a number of possible routes to redirect to.
      In this case, we provide an object of targets, where the key is the
      identifier name for the target, and the value is the target path
      e.g
          caseTargets = {
            home: '/',
            search: '/search'
          }
      The process function that is used in this case is expected to return
      a string that equals a key in the caseTargets. If the process function
      returns a key that does not exist in caseTargets, it will fail to redirect
      and alert an error.

*/

interface IRedirect {
  onSuccess?: string
  onError?: string
  caseTargets?: { [key: string]: string }
  process: (() => string) | (() => boolean)
}

const Redirect = ({onSuccess, onError, caseTargets, process}: IRedirect) => {

  const history = useHistory ()

  // process the redirect
  useEffect(() => {

    // process
    const result: string | boolean = process ()

    // if we are in case 1
    if (typeof result === "boolean") {

      if (result) history.push(onSuccess!)
      else history.push(onError!)

    }
    // if we are in case 2
    else if (typeof result === "string") {

      if (_.has(caseTargets!, result)) history.push(caseTargets![result as string])
      else alert(`case target "${result}" is not defined.`)

    }
    else {
      alert ("Invalid redirect process")
    }

  })

}

export default Redirect