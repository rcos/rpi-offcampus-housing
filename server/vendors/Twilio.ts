const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
/**
 * Twilio API Wrapper
 * 
 * @desc Handle twilio API requests
*/

export const Twilio = {

    sendSMS: (message: string, to: string) => {
        twilioClient.messages.create({
            body: message,
            from: '+12055510725',
            to
        })
        .then((message: any) => {
        })
    }
}