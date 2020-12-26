import webpush from 'web-push'
import {Landlord} from '../GQL/entities/Landlord'
import {Student} from '../GQL/entities/Student'
import {DocumentType} from '@typegoose/typegoose'

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

}