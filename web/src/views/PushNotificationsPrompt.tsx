import React, { useEffect } from 'react'
import Centered from '../components/toolbox/layout/Centered'
import Button from '../components/toolbox/form/Button'
import {ReduxState} from '../redux/reducers/all_reducers'
import {useSelector} from 'react-redux'
import AuthAPI from '../API/AuthAPI'

const PushNotificationsPrompt = () => {

    const user = useSelector((state: ReduxState) => state.user)

    useEffect(() => {
        if (Notification.permission == 'granted') {
            goToNextView ();
        }

        userAlreadySubscribed();

        // testing getSubscription
        navigator.serviceWorker.ready.then(registration => {
            registration.pushManager.getSubscription()
            .then(push_subscription => {
                console.log(`Subscription: `, push_subscription)
            })
            .catch(err => {
                console.log(`Error getting subscription`)
                console.error(err)
            })
        })
        .catch(err => {
            console.log(`Error getting service worker registration`);
            console.error(err)
        })

    }, [user])
    
    /**
     * userAlreadySubscribed
     * @desc Determine whether the user that is logged in is already
     * subscribed to push subscriptions on this browser
     */
    const userAlreadySubscribed = (): boolean => {

        // user data not returned yet.
        if (!user || !user.user) return false;

        console.log(`user subscriptions`, user.user.user_settings)
        return false;
    }

    const goToNextView = () => {
        console.log(`Permission already granted. Going to next view!`)
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
            return <div>PLACEHOLDER</div>
        }
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

                        AuthAPI.subscribeToPush(
                            user.type,
                            user.user._id,
                            evt.data.data.subscription
                        )
                        .then(res => {
                            console.log(`Subscription response`, res)
                        })
                        .catch(err => {
                            console.log(`Error subscribing`, err)
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

export default PushNotificationsPrompt