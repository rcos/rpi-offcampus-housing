import React, { useEffect } from 'react'
import Centered from '../components/toolbox/layout/Centered'
import Button from '../components/toolbox/form/Button'
import {ReduxState} from '../redux/reducers/all_reducers'
import {StudentInfo, LandlordInfo} from '../redux/actions/user'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router'
import AuthAPI from '../API/AuthAPI'
import Cookies from 'universal-cookie'

const PushNotificationsPrompt = () => {

    const cookies = new Cookies()
    const history = useHistory();
    const user = useSelector((state: ReduxState) => state.user)

    useEffect(() => {
        // if (Notification.permission == 'granted') {
        //     goToNextView ();
        // }

        userAlreadySubscribed(user).then(isSubscribed => {
            console.log(`Is user already subscribed ? ${isSubscribed}`)
            if (isSubscribed) goToNextView();
        })

    }, [user])

    const goToNextView = () => {
        // console.log(`Permission already granted. Going to next view!`)
        history.push('/')
    }

    const showPrompt = () => {
        if (!user || !user.user) return ""
        if (user.type == "student") {
            return <React.Fragment>
                <div style={{marginBottom:`8px`}}>Don't miss out on a potential lease or sublet.</div>
                By enabling push notifications, you will be notified about leases and sublets
                that you are looking for.
            </React.Fragment>
        }
        if (user.type == "landlord") {
            return <div>
                Enable push notifications in order to be notified when someone is interested
                in your property lease!
            </div>
        }
    }

    const setNotifCookie = () => {
        let next_date_to_ask = new Date ( /* Today's date */ new Date().getTime() +  /* 2 weeks from now */ (1000 * 60 * 60 * 24 * 14) );
        cookies.set('notif', next_date_to_ask.getTime().toString(), {
            maxAge: next_date_to_ask.getTime() * 0.0001
        })
    }

    const declineEnableNotifications = () => {
        // ask again 2 weeks from now
        setNotifCookie();

        // go to homepage
        goToNextView();
    }

    const promptEnableNotifications = () => {
        Notification.requestPermission().then((result) => {

            if (result === 'granted') {
                console.log(`Subscribing to push...`)
                
                if (!navigator.serviceWorker) {
                    console.error(`No service worker found.`);
                    return;
                }

                // Attach event listener to serviceWorker message
                navigator.serviceWorker.addEventListener('message', (evt) => {
                    console.log(`Recieved message from service worker!`, evt)

                    // TODO add the subscription to the user's account!
                    // TODO then add cookie
                    if (!Object.prototype.hasOwnProperty.call(evt.data, `type`)) {
                        console.error(`Service worker message provided no type`);
                        return;
                    }

                    if (evt.data.type == "prompt-user-enable-push-notif-response") {
                        
                        if (!user || !user.user) {
                            console.error(`cannot subscribe to push b/c user is undefined`);
                            return;
                        }
                        if (user.type == undefined) {
                            console.error(`cannot subscribe to push b/c user type is undefined.`);
                            return;
                        }
                        
                        if (!Object.prototype.hasOwnProperty.call(evt.data, `data`)
                        || !Object.prototype.hasOwnProperty.call(evt.data.data, `subscription`)) {
                            console.error(`No subscription data found from service worker push-notification-response message`)
                        }

                        setNotifCookie();
                        AuthAPI.subscribeToPush(
                            user.type,
                            user.user._id,
                            evt.data.data.subscription
                        )
                        .then(res => {
                            goToNextView();
                        })
                    }
                })

                // Send message to service worker to subscribe to pushManager
                navigator.serviceWorker.ready.then(registration => {
                    if (!registration.active) {console.error(`No service worker found`); return;}
                    registration.active.postMessage({
                        type: "prompt-user-enable-push-notif",
                        data: {
                            applicationServerKey: 
                                urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC as string)
                        }
                    });
                })
            }
            else {
                console.error(`Notification permission not granted...`)
            }

            // send test notification
            // new Notification("Test Notification", {
            //     body: "This is just a test notification :)"
            // });

        })
    }

    return (<Centered width={400} height={300}>
        <div>
            <div style={{fontSize: `1.3rem`, color: `#3B4353`, fontWeight: 600, marginBottom: `10px`}}>
                Enable Notifications
            </div>

            <div style={{color: `#3B4353`}}>{showPrompt()}</div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: `center`, marginTop: `15px`}}>
                <div 
                    onClick={declineEnableNotifications}
                    style={{width: `25%`, color: `#80919e`, fontSize: `0.8rem`, cursor: 'pointer'}}>
                    No thanks
                </div>
                <div style={{width: `25%`}}>
                    <Button onClick={promptEnableNotifications} text="Enable" textColor="white" background="#3B4353" />
                </div>
            </div>
        </div>
    </Centered>)
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * userAlreadySubscribed
 * @desc Determine whether the user that is logged in is already
 * subscribed to push subscriptions on this browser
 */
export const userAlreadySubscribed = async (user: null | StudentInfo | LandlordInfo): Promise<boolean> => {

    // user data not returned yet.
    if (!user || !user.user) return false;
    if (!navigator.serviceWorker) {
        console.error(`No service worker registered.`);
        return false;
    }

    // check the current subscription
    return new Promise((resolve, _) => {
        navigator.serviceWorker.ready.then(registration => {
            registration.pushManager.getSubscription()
            .then(push_subscription => {
                console.log(user.user!.user_settings.push_subscriptions)

                if (push_subscription == null) {
                    resolve(false); return;
                }

                // find the subscription with the same endpoint
                for (let i = 0; i < user.user!.user_settings.push_subscriptions.length; ++i) {
                    if (user.user!.user_settings.push_subscriptions[i].endpoint == push_subscription.endpoint) {
                        resolve(true);
                        return;
                    }
                }

                resolve(false);
                return;
            })
            .catch(err => {
                console.log(`Error occurred getting current subscription.`)
                resolve (false);
            })
        })
    })

}

export const shouldPromptToEnableNotifications = async (user: StudentInfo | LandlordInfo | null): Promise<boolean> => {
    return new Promise((resolve, reject) => {


        userAlreadySubscribed(user)
        .then(isSubscribed => {

            console.log(`TESTING: is Subscribed? ${isSubscribed}`)
            // if the the user is already subscribed, do not prompt to subscribe again
            if (isSubscribed) {
                resolve(false);
                return;
            }

            // if the user is NOT subscribed, check if the cookie notif exists.
            //      If the cookie does not exist, then prompt the user to enable notifications.
            //      If the cookie is set, only prompt the user to enable if the cookie time expires 
            else {
                const cookies = new Cookies();
                let next_prompt_time = cookies.get(`notif`)
                if (next_prompt_time == undefined) {
                    resolve(true);
                    return;
                }

                else {
                    let next_date = new Date(parseInt(next_prompt_time));
                    if (new Date() >= next_date) {
                        resolve(true);
                        return;
                    }
                    else {
                        resolve(false);
                        return;
                    }
                }
            }

        })
    })
}

export default PushNotificationsPrompt