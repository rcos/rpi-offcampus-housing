import React, {useEffect, useState} from 'react'
import {FiAlertTriangle} from 'react-icons/fi'
import {HiX} from 'react-icons/hi'
import {useSelector} from 'react-redux'
import {useHistory, useLocation} from 'react-router'

import {useUpdatePhoneNumberMutation} from '../API/queries/types/graphqlFragmentTypes'
import {ReduxState} from '../redux/reducers/all_reducers'
import Centered from '../components/toolbox/layout/Centered'
import Input, {numbersOnly, maxLen, $and} from '../components/toolbox/form/Input'
import Button from '../components/toolbox/form/Button'
import smsAPI from '../API/SMS_API'
/**
 * PhoneVerifyView
 * @desc Allow landlord to verify their phone number using
 * the Twilio API.
 * 
 * Upon successful verification, redirect to the restricted
 * view.
 */

const PhoneVerifyView = () => {

    const user = useSelector((state: ReduxState) => state.user)
    const [onTwilioPortion, setOnTwilioPortion] = useState<boolean>(false)
    const [phoneNumber, setPhoneNumber] = useState<{country_code: string, phone_number: string}>({
        country_code: "+1",
        phone_number: ""
    })
    const [confirmCode, setConfirmCode] = useState<string>("")
    const [error, setError] = useState<{hasError: boolean, message: string}>({
        hasError: false,
        message: ''
    })
    const [UpdatePhoneNumber, {data: updatePhoneNumberResult}] = useUpdatePhoneNumberMutation()
    const history = useHistory()
    const location = useLocation()

    useEffect(() => {
        if (!location || !location.state || !(location.state as any).redirect) {
            history.push('/')
        }
    }, [])

    useEffect(() => {
        if (user && user.user) {
            if (user.type == 'landlord' && user.user.phone_number) {
                history.goBack()
            }
        }
    }, [user])

    useEffect(() => {
        if (updatePhoneNumberResult
            && updatePhoneNumberResult.updatePhoneNumber) {
                
                if (updatePhoneNumberResult.updatePhoneNumber.error) {
                    setError({
                        hasError: true,
                        message: updatePhoneNumberResult.updatePhoneNumber.error
                    })
                }
                else if (updatePhoneNumberResult.updatePhoneNumber.data) {
                    // history.push((location.state as any).redirect)
                    window.location.reload()
                }
        }
    }, [updatePhoneNumberResult])

    const backtrack = () => {
        // go back to the phone number portion
        setError({hasError: false, message: ''})
        setOnTwilioPortion(false)
    }

    const verify = () => {
        let phone_number_ = `${phoneNumber.country_code}${phoneNumber.phone_number}`
        smsAPI.verifyPhone(phone_number_, confirmCode)
        .then(res => {
            if (res.data.success) {

                // update their phone number
                UpdatePhoneNumber({
                    variables: {
                        phone_number: phone_number_,
                        landlord_id: user && user.user ? user.user._id : ''
                    }
                })
            }
            else {
                setError({
                    hasError: true,
                    message: 'Invalid confirmation code'
                })
            }
        })
    }

    const resendVerification = () => {
        let phone_number_ = `${phoneNumber.country_code}${phoneNumber.phone_number}`
        smsAPI.initPhoneVerification(phone_number_)
    }

    const initVerification = () => {
        if (phoneNumber.country_code.length == 0 || phoneNumber.phone_number.length == 0) {
            setError({
                hasError: true,
                message: 'Enter your phone number'
            })
            return;
        }
        let phone_number_ = `${phoneNumber.country_code}${phoneNumber.phone_number}`
        smsAPI.initPhoneVerification(phone_number_)
        .then(res => {
            if (res.data.success) {
                setError({hasError: false, message: ''})
                setOnTwilioPortion(true)
            }
            else {
                setError({
                    message: `Problem occurred sending SMS. Please try again.`,
                    hasError: true
                })
            }
        })
    }

    return (<Centered width={400} height={500}>
        <div>
            <div className="title-1" style={{marginBottom: '20px'}}>Phone Number Verification</div>
            
            {onTwilioPortion && 
            <div>

                <div style={{
                    fontFamily: 'mukta',
                    fontSize: '0.9rem',
                    lineHeight: '18px'
                }}>A 6-number code has been sent to the phone number:</div>
                <div style={{
                    fontFamily: 'mukta',
                    fontSize: `1rem`,
                    marginTop: `5px`,
                    position: 'relative'
                }}>
                    <span style={{
                        color: `#79b5ae`
                    }}>
                        {phoneNumber.country_code} {phoneNumber.phone_number}
                    </span>
                    <div className="subtle-button" style={{
                        float: 'right',
                        position: 'relative',
                        top: '3px'
                    }}
                        onClick={() => backtrack()}>
                        new number
                    </div>
                </div>

                {/* Confirmation Code */}
                <div style={{
                    marginTop: `20px`
                }}>
                    <Input 
                        label="confirm code"
                        inputFilters={[$and(numbersOnly, maxLen(6))]}
                        autoFocus={true}
                        onChange={(val: string) => setConfirmCode(val)}
                    />
                    {!error.hasError && <div style={{marginBottom: '10px'}} />}
                    {error.hasError && <div className="error-line error"><span className="icon-holder">
                        <HiX /></span>{error.message}
                    </div>}
                    
                    <div style={{
                        width: '100px',
                        float: 'right'
                    }}>
                        <Button 
                            text="Verify"
                            background="#99E1D9"
                            onClick={verify}
                        />
                    </div>
                    <div style={{
                        width: '100px',
                        float: 'right',
                        marginRight: '10px'
                    }}>
                        <Button 
                            text="Resend"
                            background="#E4E4E4"
                            onClick={resendVerification}
                        />
                    </div>

                    <div style={{
                        width: '100px',
                        float: 'left',
                        marginRight: '10px'
                    }}>
                        <Button 
                            text="Cancel"
                            background="#E4E4E4"
                        />
                    </div>
                </div>

            </div>}

            {!onTwilioPortion && <div>
                <div className="error-line warning" style={{
                    position: 'relative',
                    top: '-10px'
                }}>

                    <div>
                        <span className="icon-holder"><FiAlertTriangle /></span>
                        You must verify your phone number in order to continue.
                    </div>
                </div>

                {/* Input Area */}
                <div style={{display: 'flex', marginTop: `10px`}}>
                    <div style={{width: `115px`, minWidth: `115px`, marginRight: `10px`}}>
                        <Input 
                            initial={phoneNumber.country_code}
                            label="Country Code"
                            inputFilters={[countryCode]}
                            onChange={(val: string) => {
                                phoneNumber.country_code = val
                                setPhoneNumber(phoneNumber)
                            }}
                        />
                    </div>
                    <div style={{flexGrow: 1}}>
                        <Input 
                            label="Phone Number"
                            inputFilters={[$and(numbersOnly, maxLen(10))]}
                            autoFocus={true}
                            onChange={(val: string) => {
                                phoneNumber.phone_number = val
                                setPhoneNumber(phoneNumber)
                            }}
                        />
                    </div>
                </div>

                {error.hasError &&
                    <div className="error-line error"><span className="icon-holder">
                        <HiX /></span>{error.message}
                    </div>
                }

                {/* Send Test */}
                <div style={{width: `200px`, float: `right`, marginTop: `10px`}}>
                    <Button 
                        text="Send"
                        background="#99E1D9"
                        onClick={initVerification}
                    />
                </div>
            </div>}

        </div>

            
    </Centered>)
}

const countryCode = (val: string): string | null => {
    if (val.length == 0) return val;

    const _g = "0123456789"
    if (val[0] == '+' || _g.includes(val[0])) {
        return numbersOnly(val.substring(1))
    }
    return null;
}

export default PhoneVerifyView