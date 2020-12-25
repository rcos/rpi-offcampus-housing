import React, { useEffect } from 'react'
import Centered from '../components/toolbox/layout/Centered'
import Button from '../components/toolbox/form/Button'
import {ReduxState} from '../redux/reducers/all_reducers'
import {useSelector} from 'react-redux'

const PushNotificationsPrompt = () => {

    const user = useSelector((state: ReduxState) => state.user)

    useEffect(() => {
        if (Notification.permission == 'granted') {
            goToNextView ();
        }
    }, [])

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
            console.log(result)

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

export default PushNotificationsPrompt