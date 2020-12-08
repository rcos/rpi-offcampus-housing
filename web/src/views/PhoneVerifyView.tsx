import React from 'react'
import {FiAlertTriangle} from 'react-icons/fi'

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

    return (<Centered width={400} height={500}>
        <div>
        <div className="title-1" style={{marginBottom: '20px'}}>Phone Number Verification</div>
            <div className="error-line warning" style={{
                position: 'relative',
                top: '-10px'
            }}>
                <span className="icon-holder"><FiAlertTriangle /></span>
                You must verify your phone number in order to continue.

                {/* Input Area */}
                <div style={{display: 'flex', marginTop: `10px`}}>
                    <div style={{width: `108px`, minWidth: `108px`, marginRight: `10px`}}>
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
            </div>
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