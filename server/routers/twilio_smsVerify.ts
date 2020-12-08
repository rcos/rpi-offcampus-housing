import express from 'express'
import chalk from 'chalk'
import {Twilio} from '../vendors/Twilio'

const smsRouter = express.Router()

interface PhoneInfo {
    expires_on: number
    verification_number: string
}
const seconds = (s: number) => s * 1000

const verifySMSString = (code: string) => `Offcmpus Phone Verification:
Below is the code you will use to verify your phone number. This code will expre in
30 seconds\n
${code}
`

class PhoneTracker {

    numbers: {[key: string]: PhoneInfo}
    constructor () {
         this.numbers = {}
    }

    clearNumbers () {
        for (let i = Object.keys(this.numbers).length - 1; i >= 0; --i) {
            let phoneInfo: PhoneInfo = this.numbers[Object.keys(this.numbers)[i]];
            // check if current time exceeds the expiration on this number.
            if (new Date().getTime() > phoneInfo.expires_on) {
                delete this.numbers[Object.keys(this.numbers)[i]];
            }
        }
    }

    handleNumber (number: string) {
        // keep alive for 30 seconds
        let code_: string = PhoneTracker.generateVerificationNumber ()

        this.numbers[number] = {
            expires_on: new Date().getTime() + seconds(30),
            verification_number: code_
        }

        Twilio.sendSMS(verifySMSString(code_), number)
    }

    testValidity (number: string, verify_code: string): boolean {
        console.log(`Test Validity`)
        if (!Object.prototype.hasOwnProperty.call(this.numbers, number)) return false;

        console.log(this.numbers[number].verification_number)
        return this.numbers[number].verification_number == verify_code;
    }

    clear (number: string): void {
        if (Object.prototype.hasOwnProperty.call(this.numbers, number)) {
            delete this.numbers[number]
        }
    }

    static generateVerificationNumber (): string {
        return Math.floor(((1 - Math.random()) * (999999 - 100000)) + 100000).toString().substring(0, 6)
    }

}

let phone_tracker = new PhoneTracker()
const phoneVerificationMiddleware = (req: any, res: express.Response, next: express.NextFunction) => {
    req.phone_tracker = phone_tracker
    next();
}

/**
 * Initialize Phone Verification:
 * Send a message to the phone number provied in the body.
 * Keep track of the phone number until it is verified or expired.
 */
smsRouter.post('/init-phone-verification', phoneVerificationMiddleware, (req: any, res: express.Response) => {
    (req.phone_tracker as PhoneTracker).clearNumbers()

    console.log(chalk.bgBlue(`👉 Initialize Phone Verification`))
    if (!Object.prototype.hasOwnProperty.call(req.body, 'phone_number')) {
        console.log(chalk.bgRed(`❌ Error: No phone number provided...`))
        res.json({
            success: false,
            error: `No number provided.`
        })
        return;
    }

    let phone_number: string = req.body.phone_number;
    (req.phone_tracker as PhoneTracker).handleNumber(phone_number);
    console.log(chalk.bgGreen(`✔ Successfully initialized phone verification for ${req.body.phone_number}`))
    res.json({
        success: true,
        data: {}
    })
})

smsRouter.post('/verify-phone', phoneVerificationMiddleware, (req: any, res: express.Response) => {
    (req.phone_tracker as PhoneTracker).clearNumbers()

    console.log(chalk.bgBlue(`👉 Verify Phone`))
    if (!Object.prototype.hasOwnProperty.call(req.body, 'phone_number')
    || !Object.prototype.hasOwnProperty.call(req.body, 'verify_code')) {
        console.log(chalk.bgRed(`❌ Missing phone number or verify code.`))
        res.json({
            success: false
        })
        return;
    }
    let phone_number: string = req.body.phone_number;
    let verify_code: string = req.body.verify_code;
    if (!(req.phone_tracker as PhoneTracker).testValidity(phone_number, verify_code)) {
        console.log(chalk.bgRed(`❌ Invalid verification code (${verify_code}) for 📞 ${phone_number}`))
        res.json({
            success: false
        })
        return;
    }

    (req.phone_tracker as PhoneTracker).clear(phone_number)
    console.log(chalk.bgGreen(`✔ Successfully verified 📞 ${phone_number}`))
    res.json({
        success: true
    })
})

export default smsRouter