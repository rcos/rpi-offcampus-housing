import sgMail, {MailDataRequired} from '@sendgrid/mail'
import {ClientResponse} from "@sendgrid/client/src/response";
import chalk from 'chalk'

export const SendGridTemplate = {
  LANDLORD_EMAIL_CONFIRMATION: 'd-3604499171e342c598f9f2edd05c7246',
  STUDENT_EMAIL_CONFIRMATION: 'd-3923fca1fef44a07b94b1a44ad46b65d',
  NOTIFICATIONS: 'd-d100bb08aa964bd9b72b74e52475e989'
}

const _sendMail_ = (mail_data: MailDataRequired | MailDataRequired[]): Promise<[ClientResponse, {}]> => {
  return sgMail.send(mail_data)
}

interface ISendMail {
  to: string
  email_template_id: string
  template_params?: {[key: string]: string}
}

const SendGrid = {
  sendMail: ({to, email_template_id, template_params}: ISendMail): void => {
    _sendMail_({
      to,
      from: (process.env.GMAIL_EMAIL as string),
      templateId: email_template_id,
      ...(template_params ? 
            {dynamic_template_data: template_params}
            : {}
        )
    })
    .then(() => {
      console.log(chalk.bgGreen(`✔ Email Sent to ${to}!`))
    }, err => {
      if (err) {
        console.log(chalk.bgRed(`❌ Error: Problem sending email to ${to}`))
        console.log(err.response.body)
      }
    })
  }
}
export default SendGrid