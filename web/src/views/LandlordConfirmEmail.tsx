import React, {useEffect} from 'react'
import {useHistory} from 'react-router'
import queryString from 'query-string'
import {useConfirmLandlordEmailMutation} from '../API/queries/types/graphqlFragmentTypes'

const LandlordConfirmEmail = ({confirm_key}: {confirm_key: string}) => {
    const history = useHistory()
    const [ConfirmEmail, {data: confirmEmailResponse}] = useConfirmLandlordEmailMutation()

    useEffect(() => {

        let query_ = queryString.parse(window.location.search)
        if (!Object.prototype.hasOwnProperty.call(query_, `email`)) {
            history.push('/')
        }
        else {
            console.log(`attempting to confirm email`)
            ConfirmEmail({
                variables: {
                    email: query_.email as string,
                    confirm_key: confirm_key
                }
            })
        }

    }, [])

    useEffect(() => {
        if (confirmEmailResponse && confirmEmailResponse.confirmLandlordEmail) {
            if (confirmEmailResponse.confirmLandlordEmail.error) {
                console.error(`Error confirming email`)
            }
            history.push('/')
        }
    }, [confirmEmailResponse])

    return (<div />)
}

export default LandlordConfirmEmail