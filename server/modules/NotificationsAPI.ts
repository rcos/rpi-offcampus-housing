import webpush from 'web-push'
import {Landlord, PushSubscription} from '../GQL/entities/Landlord'
import {Student} from '../GQL/entities/Student'
import {DocumentType} from '@typegoose/typegoose'
import SendGrid, {SendGridTemplate} from '../vendors/SendGrid'

/**
 * NotificationsAPI
 * =============================
 * NotificationsAPI handles the sending of notifications
 * through Push Notifications & Email.
 */
export class NotificationsAPI {

    static _instance: NotificationsAPI | null = null;
    static getSingleton (): NotificationsAPI {
        if (this._instance == null) {
            this._instance = new NotificationsAPI();
        }
        return this._instance;
    }

    // Class Methods

    /**
     * addPushSubscription ()
     * @param user_: Student | Landlord -> The user to add the subscription to
     * @param subscription_ -> The subscription information to store
     */
    async addPushSubscription (
        user_: DocumentType<Student> | DocumentType<Landlord>,
        subscription_: webpush.PushSubscription
    ): Promise<any> {

        console.log(`Adding push subscription`);
        console.log(subscription_);
        user_.user_settings.push_subscriptions.push(subscription_);
        return user_.save();
    }

    /**
     * Send a notification to a user through pusn notifications & email
     * @param user_: Student | Landlord => The user to send a notification to
     * @param options => Options about what type of notifications should be sent
     */
    sendNotification (
        user_: DocumentType<Student> | DocumentType<Landlord>, 
        notification_data: NotificationProps,
        // default options
        options: SendNotificationOptions = {
            sendEmailNotifiation: false,
            sendPushNotification: true
        }) {

            // send push notifications
            if (options.sendPushNotification) {
                for (let i = 0; i < user_.user_settings.push_subscriptions.length; ++i) {
                    this._sendPushNotificationToSubscription_( user_.user_settings.push_subscriptions[i], notification_data );
                }
            }

            // send email notifications
            if (options.sendEmailNotifiation) {
                SendGrid.sendMail({
                    to: user_.email.toString(),
                    email_template_id: SendGridTemplate.NOTIFICATIONS,
                    template_params: {
                        title: notification_data.title,
                        body: notification_data.body,
                        ...(
                            notification_data.emailOptions ?
                            {
                                ...(notification_data.emailOptions.action_text? {action_text: notification_data.emailOptions.action_text} : {}),
                                ...(notification_data.emailOptions.action_url? {action_url: notification_data.emailOptions.action_url} : {}),
                            }:
                            {}
                        )
                    }
                })
            }
    }

    private _sendPushNotificationToSubscription_ (subscription: PushSubscription, notification_info: NotificationProps) {
        webpush.sendNotification(
            // the subscription object
            {
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth
                }
            },

            // the payload of the notification
            JSON.stringify({
                title: notification_info.title,
                body: notification_info.excerpt
            })
        )
    }
}

interface NotificationEmailProps {
    action_text?: string
    action_url?: string
}

interface NotificationProps {
    title: string
    excerpt: string
    body: string
    emailOptions?: NotificationEmailProps
}

interface SendNotificationOptions {
    sendEmailNotifiation: boolean
    sendPushNotification: boolean
}