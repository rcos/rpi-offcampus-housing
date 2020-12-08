import React, {useState} from 'react'
import {FiAlertTriangle} from 'react-icons/fi'
import {HiX} from 'react-icons/hi'

import Centered from '../components/toolbox/layout/Centered'
import Input, {numbersOnly, maxLen, $and} from '../components/toolbox/form/Input'
import Button from '../components/toolbox/form/Button'
/**
 * PhoneVerifyView
 * @desc Allow landlord to verify their phone number using
 * the Twilio API.
 * 
 * Upon successful verification, redirect to the restricted
 * view.
 */

const PhoneVerifyView = () => {

    const [onTwilioPortion, setOnTwilioPortion] = useState<boolean>(true)
    const [phoneNumber, setPhoneNumber] = useState<{country_code: string, phone_number: string}>({
        country_code: "+1",
        phone_number: "1920194812"
    })

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
                }}>{phoneNumber.country_code} {phoneNumber.phone_number}
                    <div className="subtle-button" style={{
                        float: 'right',
                        position: 'relative',
                        top: '3px'
                    }}>
                        new number
                    </div>
                </div>

                {/* Confirmation Code */}
                <div style={{
                    marginTop: `20px`
                }}>
                    <Input 
                        label="confirm code"
                        inputFilters={[numbersOnly]}
                        autoFocus={true}
                    />
                    <div className="error-line error"><span className="icon-holder">
                        <HiX /></span>Invalid code
                    </div>
                    
                    <div style={{
                        width: '100px',
                        float: 'right'
                    }}>
                        <Button 
                            text="Verify"
                            background="#99E1D9"
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
                            initial="+1"
                            label="Country Code"
                            inputFilters={[countryCode]}
                        />
                    </div>
                    <div style={{flexGrow: 1}}>
                        <Input 
                            label="Phone Number"
                            inputFilters={[$and(numbersOnly, maxLen(10))]}
                            autoFocus={true}
                        />
                    </div>
                </div>

                {/* Send Test */}
                <div style={{width: `200px`, float: `right`, marginTop: `10px`}}>
                    <Button 
                        text="Send"
                        background="#99E1D9"
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