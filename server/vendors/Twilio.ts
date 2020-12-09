
import chalk from 'chalk'

let twilioClient: null | any = null;
if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
}
/**
 * Twilio API Wrapper
 * 
 * @desc Handle twilio API requests
*/

export const Twilio = {

    sendSMS: (message: string, to: string) => {
        if (twilioClient == null) {
            console.log(chalk.bgRed(`❌ Error: Twilio client not initialized.`))
            return;
        }
        twilioClient.messages.create({
            body: message,
            from: '+12055510725',
            to
        })
        .then((message: any) => {
        })
    }
}