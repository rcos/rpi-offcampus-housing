import API from './API'

const smsAPI = {

    initPhoneVerification: (phone_number: string) => 
    API.post(`/vendor/twilio/init-phone-verification`, {
        phone_number: phone_number
    }),

    verifyPhone: (phone_number: string, verify_code: string) => 
    API.post(`/vendor/twilio/verify-phone`, {
        phone_number,
        verify_code
    })
}

export default smsAPI