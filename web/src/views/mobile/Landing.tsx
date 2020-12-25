import React, { useEffect, useRef, useState } from 'react'
import {studentLandingCanvas, landlordLandingCanvas} from '../Landing'
import {motion, useSpring, useTransform} from 'framer-motion'
import DramaticButton from '../../components/toolbox/form/DramaticButton'
import RectMouseMagnet from '../../components/toolbox/misc/RectMouseMagnet'
import UnauthMobileMenu from '../../components/toolbox/misc/UnauthMobileMenu'

interface LandingProps {
    initialLandlord: boolean
}
const Landing = ({
    initialLandlord
}: LandingProps) => {

    const bodyRef = useRef<HTMLDivElement>(null)
    const [showLandlordView, setShowLandlordView] = useState<boolean>(initialLandlord)
    const [showStudentView, setShowStudentView] = useState<boolean>(!initialLandlord)

    const changeView = (view: string): void => {
        console.log(`change view => ${view}`)
        console.log(`\tcurrently showing student? ${showStudentView}`)
        console.log(`\tcurrently showing landlord? ${showLandlordView}`)
        if (view == 'student') {
            if (showStudentView) return;
            
            setShowLandlordView(false)
            setTimeout(() => { setShowStudentView(true) }, 500)
        }
        else if (view == 'landlord') {
            if (showLandlordView) return;
            
            setShowStudentView(false)
            setTimeout(() => { setShowLandlordView(true) }, 500)
        }
    }

    useEffect(() => {

        if (bodyRef.current) {
            console.log(`doc bounds`, document.documentElement.clientHeight)
            console.log(`body bounds`, bodyRef.current.getBoundingClientRect())
            bodyRef.current.style.height = `${document.documentElement.clientHeight - bodyRef.current.getBoundingClientRect().top - 10}px`;
        }
    }, [bodyRef])

    return (
        <UnauthMobileMenu
            menu_info={[{
                label: 'Student Menu',
                links: [{
                    name: 'Login'
                },{
                    name: 'Register'
                }]
            },{
                label: 'Landlord Menu',
                links: [{
                    name: 'Login'
                },{
                    name: 'Register'
                }]
            }]}
        >
            <div>
            
            {/* Tab Slider */}
            <div style={{
                maxWidth: '500px',
                margin: '0 auto'
            }}>
                <div className="mobile-tab-slider">
                    <div className="_slider no-select">
                        <div onClick={() => changeView('student')}
                            className={`_tab ${showStudentView ? `active` : ``}`}>I am a Student</div>
                        <div onClick={() => changeView('landlord')}
                            className={`_tab ${showLandlordView ? `active` : ``}`}>I am a Landlord</div>
                    </div>
                </div>
            </div>

            <div ref={bodyRef} style={{
                position: 'relative',
                maxWidth: `500px`,
                margin: '0 auto'
            }}>
                <div style={{
                    // border: `1px solid red`,
                    position: 'absolute',
                    top: 0, left: 0, right: 0
                }}><StudentLandingMobile show={showStudentView} /></div>
                <div style={{
                    // border: `1px solid green`,
                    position: 'absolute',
                    top: 0, left: 0, right: 0
                }}><LandlordLandingMobile show={showLandlordView} /></div>
            </div>

            <div style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                height: `60px`,
                display: 'flex',
                justifyContent: 'space-around'
            }}>

                <div style={{width: `45%`}}>
                    <RectMouseMagnet><DramaticButton 
                        linkTo={showStudentView ? "/student/login" : "/landlord/register"}
                        show={true}
                        text="Register"
                        background="#3B4353"
                        background2="#7080A1"
                        background3="#E0777D"
                    /></RectMouseMagnet>
                </div>

                <div style={{width: `45%`}}>
                    <RectMouseMagnet><DramaticButton 
                        linkTo={showStudentView ? "/student/login" : "/landlord/login"}
                        show={true}
                        text="Login"
                        background="#E0777D"
                        background2="#7080A1"
                        background3="#3B4353"
                    /></RectMouseMagnet>
                </div>

            </div>

        </div>
    </UnauthMobileMenu>
    )
}

const StudentLandingMobile = ({show}: {show: boolean}) => {

    const showSpring = useSpring(0)
    const visibilityTransform = useTransform(showSpring, (x: number) => {
        if (x <= 0.1) return 'hidden'
        return 'visible'
    })
    const titleTranslate = useTransform(showSpring, [0, 1], [-10, 0])
    const bodyTranslate = useTransform(showSpring, [0, 1], [-15, 0])

    useEffect(() => {
        if (show) showSpring.set(1)
        else showSpring.set(0)
    }, [show])

    return (<motion.div
        style={{
            opacity: showSpring,
            visibility: visibilityTransform
        }}
    >
        
        <motion.div style={{
            margin: `0 10px`
        }}>
            {studentLandingCanvas(show)}
        </motion.div>

        <div>
            <motion.div style={{
                fontSize: `1.2rem`,
                color: '#3B4353',
                marginBottom: '30px',
                marginTop: '40px',
                padding: '0 10px',
                fontWeight: 600,
                translateX: titleTranslate
            }}>
                Find Off Campus Housing
            </motion.div>
            <motion.div style={{
                padding: '0 20px',
                lineHeight: '20px',
                translateX: bodyTranslate
            }}>
                Join a community of students and landlords to find your next 
                lease near your school's campus!
            </motion.div>
        </div>

    </motion.div>)
}

const LandlordLandingMobile = ({show}: {show: boolean}) => {

    const showSpring = useSpring(0)
    const visibilityTransform = useTransform(showSpring, (x: number) => {
        if (x <= 0.1) return 'hidden'
        return 'visible'
    })
    const titleTranslate = useTransform(showSpring, [0, 1], [-10, 0])
    const bodyTranslate = useTransform(showSpring, [0, 1], [-15, 0])

    useEffect(() => {
        if (show) showSpring.set(1)
        else showSpring.set(0)
    }, [show])

    return (<motion.div
        style={{
            opacity: showSpring,
            visibility: visibilityTransform
        }}
    >
        
        <motion.div style={{
            margin: `10px 10px`,
            translateX: `15px`
        }}>
            {landlordLandingCanvas(show)}
        </motion.div>

        <div>
            <motion.div style={{
                fontSize: `1.2rem`,
                color: '#3B4353',
                marginBottom: '30px',
                marginTop: '40px',
                padding: '0 10px',
                fontWeight: 600,
                translateX: titleTranslate
            }}>
                Find Students to Lease Your Property
            </motion.div>
            <motion.div style={{
                padding: '0 20px',
                lineHeight: '20px',
                translateX: bodyTranslate
            }}>
                Join a network of students looking for leases
                near college campuses.
            </motion.div>
        </div>

    </motion.div>)
}

export default Landing