import React, { useState, useEffect, useRef } from 'react'

import Logo from '../components/Logo'
import Button from '../components/toolbox/form/Button'
import Canvas from '../components/toolbox/misc/Canvas'

import AddProperty from '../assets/svg/onboarding/add_property.svg'
import SignLease from '../assets/svg/onboarding/sign_lease.svg'
import ManageStudents from '../assets/svg/onboarding/manage_students.svg'
import {motion, useSpring, useTransform} from 'framer-motion'
import {useHistory} from 'react-router'
import {useSelector, useDispatch} from 'react-redux'
import {ReduxState} from '../redux/reducers/all_reducers'
import {useOnboardLandlordMutation} from '../API/queries/types/graphqlFragmentTypes'
import {fetchUser} from '../redux/actions/user'

const LandlordOnboarding = () => {

    const user = useSelector((state: ReduxState) => state.user)

    const dispatch = useDispatch()
    const history = useHistory()
    const [OnboardLandlord, {data: onboardResponse}] = useOnboardLandlordMutation()

    const TabInfo = [
        {
            title: 'Add Properties to Manage Leases For',
            info: 'Add your property to your account and our staff will go through your submission to confirm that you own that property',
            canvasImg: {component: AddProperty, translatePos: { start:{x: 0.5, y: 0.5}, end: {x: 0.5, y: 0.52} }, width: 0.8, height: 0.8, zIndex: 0, delay: 500, duration: 500},
        },
        {
            title: 'Create Lease Periods',
            info: 'Looking to lease your property for soon? Create a lease period on your property and students will find it with ease!',
            canvasImg: {component: SignLease, translatePos: { start:{x: 0.5, y: 0.5}, end: {x: 0.5, y: 0.52} }, width: 0.8, height: 0.8, zIndex: 0, delay: 500, duration: 500},
        },
        {
            title: 'Manage Student Renters',
            info: 'Want to extend or a lease for a student? After creating a lease, you can manage the and update the information as you please.',
            canvasImg: {component: ManageStudents, translatePos: { start:{x: 0.5, y: 0.5}, end: {x: 0.5, y: 0.52} }, width: 0.8, height: 0.8, zIndex: 0, delay: 500, duration: 500},
        }
    ]

    const [showCanvas, setShowCanvas] = useState<boolean>(true)
    const [activeTab, setActiveTab] = useState<number>(0)
    const nextTabRef = useRef<number>(0)
    
    useEffect(() => {

        if (user && !user.authenticated) {
            history.push('/')
        }

        if (user && user.user && (user.user as any).onboarded == undefined) {
            history.push('/')
        }

    }, [user])

    useEffect(() => {
        entrySpring.set(1);
    }, [activeTab])

    useEffect(() => {
        const unmountEntrySpring = entrySpring.onChange((x: number) => {
            if (x == 0) {
                setActiveTab(nextTabRef.current)
                setShowCanvas(true)
            }
        })

        return () => {
            unmountEntrySpring();
        }
    }, [])

    useEffect(() => {

        if (onboardResponse && onboardResponse.setLandlordOnboarded
            && onboardResponse.setLandlordOnboarded.success) {
                dispatch(fetchUser(user, {update: true}))
            }
    }, [onboardResponse])

    const initExitAnim = (to_tab: number) => {
        entrySpring.set(0);
        nextTabRef.current = to_tab;
        setShowCanvas(false);
    }

    const setAsOnboarded = () => {
        if (user && user.user) {
            OnboardLandlord({
                variables: {
                    landlord_id: user.user._id
                }
            })
        }
    }

    const entrySpring = useSpring(1, {duration: 800})
    const titleTranslateX = useTransform(entrySpring, [0, 1], [-10, 0])
    const pgTranslateX = useTransform(entrySpring, [0, 1], [-5, 0])

    return (<div className="onboarding-container">

        <div
            style={{
                width: `150px`,
                margin: `20px auto 0 auto`
            }}
        ><Logo withText={true} withBeta={true} /></div>

        {/* Canvas */}
        <motion.div style={{opacity: entrySpring}} className="canvas-container">
            <Canvas 
                show={showCanvas}
                items={[ TabInfo[activeTab].canvasImg ]}
            />
        </motion.div>

        {/* Text Area */}
        <div className="text-info">
            <motion.div style={{opacity: entrySpring, translateX: titleTranslateX}} className="title__">{TabInfo[activeTab].title}</motion.div>
            <motion.div className="pg__" style={{opacity: entrySpring, translateX: pgTranslateX}}>
                {TabInfo[activeTab].info}
            </motion.div>
        </div>
        
        {/* Footer Navigator */}
        <div style={{
            position: `fixed`,
            bottom: 0,
            left: 0, right: 0,
            height: `100px`
        }}>
            <div style={{
                width: `400px`,
                margin: `0 auto`
            }}>

                <div style={{width: `100px`, margin: `0 auto`}}>
                    <OnboardSlider onTabClick={(_: number) => initExitAnim(_)} tabs={3} activeTab={activeTab} />
                </div>

                <div style={{marginTop: `20px`, width: `150px`, float: `right`}}>
                    <Button text={activeTab == 2? "Sounds Good" : "Next"} background={activeTab == 2 ? "#E0777D" : "#3B4353"} textColor="white" 
                        onClick={() => {
                            if (activeTab < 2) initExitAnim(activeTab + 1)
                            else setAsOnboarded ()
                        }}
                    />
                </div>

            </div>
        </div>

    </div>)
}


interface OnboardSliderProps {
    tabs: number
    activeTab: number
    onTabClick: (_: number) => void
}

const OnboardSlider = ({tabs, activeTab, onTabClick}: OnboardSliderProps) => {

    return (<div className="onboard-slider">

        {Array.from(new Array(tabs), (_: any, i: number) => 
            <div
                onClick={() => {
                    onTabClick(i)
                }}
                key={i}
                className={`onboard-slider-pin ${activeTab == i ? `active` : ``}`} 
                style={{
                width: `${Math.max(3, (100 / tabs) - 18)  }%`
            }} /> 
        )}

    </div>)
}

export default LandlordOnboarding