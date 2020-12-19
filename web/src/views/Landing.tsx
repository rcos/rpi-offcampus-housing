import React, {useEffect, useRef, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {motion, useSpring, useTransform} from 'framer-motion'
import queryString from 'query-string'

import LeftAndRight from '../components/toolbox/layout/LeftAndRight'
import Logo from '../components/Logo'
import Button from '../components/toolbox/form/Button'
import DropdownButton from '../components/toolbox/form/DropdownButton'
import Centered from '../components/toolbox/layout/Centered'
import Toggle2 from '../components/toolbox/form/Toggle2'
import SuggestionInput from '../components/toolbox/form/SuggestionInput'
import RectMouseMagnet from '../components/toolbox/misc/RectMouseMagnet'
import DramaticButton from '../components/toolbox/form/DramaticButton'
import Canvas from '../components/toolbox/misc/Canvas'

// SVG Imports
import HouseSVG from '../assets/svg/landing/house.svg'
import House2SVG from '../assets/svg/landing/house1.svg'
import ContractSVG from '../assets/svg/landing/contract.svg'
import Person1SVG from '../assets/svg/landing/person1.svg'
import Person2SVG from '../assets/svg/landing/person2.svg'
import Person3SVG from '../assets/svg/landing/person3.svg'
import RedTriangle from '../assets/svg/landing/red_triangle.svg'
import BlueTriangle from '../assets/svg/landing/blue_triangle.svg'
import BlueTriangle2 from '../assets/svg/landing/blue_triangle2.svg'

const LandingPage = () => {
  const history_ = useHistory()

  const getInitialView = (): 'student' | 'landlord' => {
    let query_ = queryString.parse(window.location.search);
    if (Object.prototype.hasOwnProperty.call(query_, 'm')) {
      let view_ = query_['m'];
      
      if (view_ == "student") {
        return 'student'
      }
      if (view_ == "landlord") {
        return 'landlord'
      }
    }

    return 'student'
  }

  const [showStudent, setShowStudent] = useState<boolean> (getInitialView() == "landlord" ? false : true)
  const [showLandlord, setShowLandlord] = useState<boolean> (getInitialView() == "landlord" ? true : false)

  useEffect(() => {

    if (showStudent) {
      let url = new URL(window.location.toString());
      url.searchParams.set('m', 'student');
      window.history.pushState({}, '', url.toString());
    }
    if (showLandlord) {
      let url = new URL(window.location.toString());
      url.searchParams.set('m', 'landlord');
      window.history.pushState({}, '', url.toString());
    }

  }, [showStudent, showLandlord])

  return (<div>

    <Centered horizontalBuffer={400} height="100%">
      <React.Fragment>

        {/* Header */}
        <div style={{marginTop: `20px`}}></div>
        <LeftAndRight 
          left={<Logo withText={true} withBeta={true} />}
          right={<LandingAction />}
        />

        {/* Selection Area for Landlord / Student */}
        <div style={{
          width: `40px`,
          margin: `10px auto`
        }}>
          <Toggle2 
            initialValue={getInitialView() == "landlord" ? false : true}
            on_label="I am a Student"
            off_label="I am a Landlord"
            onToggle={(val: boolean, option: string) => {
              if (val) {
                setShowLandlord(false);
                setTimeout(() => {setShowStudent(true);}, 500)
              }
              else {
                setShowStudent(false);
                setTimeout(() => {setShowLandlord(true);}, 500)
              }
            }}
          />
        </div>

        {/* Landing Content */}
        <StudentLanding show={showStudent} />
        <LandlordLanding show={showLandlord} />

      </React.Fragment>
    </Centered>

  </div>)
}

const StudentLanding = ({
  show
}: {show: boolean}) => {

  useEffect(() => {
    let t_1: null | NodeJS.Timeout = null
    if (show) showLandingSpring.set(1)
    else t_1 = setTimeout(() => {showLandingSpring.set(0)}, 500)

    return () => {
      if (t_1 != null) clearTimeout(t_1)
    }
  }, [show])

  const showLandingSpring = useSpring(0)
  const visibilityTransform = useTransform(showLandingSpring, (x: number) => {
    if (x < 0.1) return `hidden`
    return `visible`
  })
  const titleTransform = useTransform(showLandingSpring, [0, 1], [-20, 0])
  const paragraphTransform = useTransform(showLandingSpring, [0, 1], [-10, 0])

  return (<motion.div 
    style={{
      opacity: showLandingSpring,
      visibility: visibilityTransform
    }}
    className="landing-content">
  <div className="left_" style={{
      width: `45%`, height: `250px`,
      top: `35%`,
      transform: `translateY(-50%)`
    }}>
    <motion.div 
      style={{translateX: titleTransform}}
      className="_title_">Find Off Campus Housing</motion.div>
    <motion.div className="_paragraph_" 
    style={{
      translateX: paragraphTransform,
      marginTop: `30px`, 
      marginBottom: `20px`}}>
    Join a community of students and landlords to find your next 
    lease near your school's campus!
    </motion.div>

    <div className="cta">
      <div className="_btn_" style={{float: `right`}}>
        {/* <Button text="Get Started" textColor="white" background="#E0777D" /> */}
        <RectMouseMagnet><DramaticButton 
          linkTo="/student/login"
          show={show}
          text="Get Started"
          background="#E0777D"
          background2="#7080A1"
          background3="#3B4353"
        /></RectMouseMagnet>
      </div>
    </div>
  </div>
  <div className="right_" 
    style={{
      width: `55%`, 
      left: `45%`,
      // height: `100%`,
      top: `50%`,
      transform: `translateY(-50%)`,
  }}>
    <Canvas 
      show={show}
      items={[
        {component: HouseSVG, translatePos: { start:{x: 0.33, y:0.6}, end:{x: 0.33, y: 0.6} }, width: 0.4, height: 0.4, zIndex: 2},
        {component: HouseSVG, translatePos: { start:{x: 0.65, y:0.5}, end:{x: 0.65, y: 0.5} }, width: 0.4, height: 0.4, zIndex: 1},
        {component: ContractSVG, translatePos: { start:{x: 0.48, y: 0.45}, end: {x: 0.48, y: 0.35} }, width: 0.4, height: 0.4, zIndex: 0, delay: 500, duration: 1200},
        {component: Person1SVG, translatePos: { start:{x: 0.95, y: 0.85}, end: {x: 0.9, y: 0.8} }, width: 0.2, height: 0.2, zIndex: 3, delay: 350, duration: 1000},
        {component: Person2SVG, translatePos: { start:{x: 0.0, y: 0.85}, end: {x: 0.05, y: 0.8} }, width: 0.2, height: 0.2, zIndex: 3, delay: 700, duration: 1000},
        {component: RedTriangle, translatePos: { start: {x: 0.05, y: 0.43}, end: {x: 0.02, y: 0.4} }, width: 0.05, height: 0.05, zIndex: 4, delay: 1200, duration: 500},
        {component: BlueTriangle, translatePos: { start: {x: 0.92, y: 0.33}, end: {x: 0.95, y: 0.3} }, width: 0.05, height: 0.05, zIndex: 4, delay: 1200, duration: 500}
      ]}
    />

    <div className="build-circle">
      <svg height="700px" width="700px">
        <motion.circle cx="350" cy="350" r="300" />
      </svg>
    </div>
  </div>
</motion.div>)
}

const LandlordLanding = ({show}: {show: boolean}) => {

  useEffect(() => {
    let t_1: null | NodeJS.Timeout = null
    if (show) showContentSpring.set(1)
    else t_1 = setTimeout(() => showContentSpring.set(0), 500)

    return () => {
      if (t_1 != null) clearTimeout(t_1);
    }
  }, [show])

  const showContentSpring = useSpring(0)
  const visibilityTransform = useTransform(showContentSpring, (x: number) => {
    if (x <= 0.1) return `hidden`
    return `visible`
  })
  const titleTransform = useTransform(showContentSpring, [0, 1], [20, 0])
  const paragraphTransform = useTransform(showContentSpring, [0, 1], [10, 0])

  return (<motion.div 
    style={{
      opacity: showContentSpring,
      visibility: visibilityTransform
    }}
    className="landing-content">
  <div className="left_" style={{
      width: `55%`,
      top: `50%`,
      transform: `translateY(-50%)`
    }}>
      
    <Canvas 
      show={show}
      items={[
        {component: Person3SVG, translatePos: {start: {x: 0.5, y: 0.55}, end: {x: 0.5, y: 0.5}}, width: 0.8, height: 0.8, zIndex: 2, delay: 600, duration: 1000},
        {component: House2SVG, translatePos: {start: {x: 0.8, y: 0.15}, end: {x: 0.76, y: 0.2}}, width: 0.3, height: 0.3, zIndex: 1, duration: 700, delay: 200},
        {component: HouseSVG, translatePos: {start: {x: 0.0, y: 0.58}, end: {x: 0.06, y: 0.52}}, width: 0.3, height: 0.3, zIndex: 1, duration: 700},
        {component: BlueTriangle2, translatePos: {start: {x: 0.15, y: 0.15}, end: {x: 0.1, y: 0.1}}, width: 0.07, height: 0.07, zIndex: 5, delay: 1500, duration: 700},
        {component: RedTriangle, translatePos: { start: {x: 0.05, y: 0.72}, end: {x: 0.02, y: 0.75} }, width: 0.05, height: 0.05, zIndex: 4, delay: 1200, duration: 500},
        {component: BlueTriangle, translatePos: { start: {x: 0.72, y: 0.65}, end: {x: 0.75, y: 0.68} }, width: 0.05, height: 0.05, zIndex: 4, delay: 1200, duration: 500}
      ]}
    />

    <div className="build-circle">
      <svg height="700px" width="700px">
        <motion.circle cx="350" cy="350" r="300" />
      </svg>
    </div>
  </div>

  {/* Right Side */}
  <div className="right_" style={{
    width: `45%`, 
    left: `55%`, 
    height: `250px`,
    top: `35%`,
    transform: `translateY(-50%)`
    }}>

    <motion.div style={{
      translateX: titleTransform
    }} className="_title_">Find Students to Lease Your Property</motion.div>
      <motion.div 
        className="_paragraph_" 
        style={{marginTop: `30px`, marginBottom: `20px`, translateX: paragraphTransform}}>
        Join a network of students looking for leases
        near college campuses.
      </motion.div>

      <div className="cta">
        <div className="_btn_" style={{
          float: `left`,
          transform: `translateX(0px)`
          }}>
          {/* <Button text="Get Started" textColor="white" background="#E0777D" /> */}
          <RectMouseMagnet><DramaticButton 
            linkTo="/landlord/register"
            show={show}
            text="Get Started"
            background="#E0777D"
            background2="#7080A1"
            background3="#3B4353"
            initial={true}
          /></RectMouseMagnet>
        </div>
      </div>
  </div>
</motion.div>)
}

const LandingAction = () => {

  const history = useHistory()

  return (<div style={{
    display: 'flex'
  }}>
    
    <span style={{marginRight: `8px`}}>
      <DropdownButton 
        text="Register"
        textColor="white"
        background="#3B4353"
        options={[
          {option: "Student", onClick: () => history.push('/student/login')},
          {option: "Landlord", onClick: () => history.push('/landlord/register')}
        ]}
      />
    </span>
    <DropdownButton 
      text="Login"
      textColor="white"
      background="#E0777D"
      options={[
        {option: "Student", onClick: () => history.push('/student/login')},
        {option: "Landlord", onClick: () => history.push('/landlord/login')}
      ]}
    />
    {/* <div style={{marginRight: '10px'}}>
      <Button 
        text="Student Login"
        background="#96b5b1"
        textColor="white"
        iconLocation="right"
        onClick={() => history.push('/student/login')}
      />
    </div>

    <Button 
      text="Landlord Login"
      background="#3B4353"
      textColor="white"
      iconLocation="right"
      onClick={() => history.push('/landlord/login')}
    /> */}

  </div>)
}

export default LandingPage