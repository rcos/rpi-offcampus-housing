import React, {useEffect, useRef, useState} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'

interface DropdownOptionProps {
    option: string
    onClick: () => void
}

interface DropdownButtonProps {
    text: string
    options: DropdownOptionProps[]
    background: string
    textColor: string
}

const DropdownButton = ({text, options, textColor, background}: DropdownButtonProps) => {
    
    const buttonRef = useRef<HTMLDivElement>(null)
    const [dropdownActive, setDropdownActive] = useState<boolean> (false)

    const dropdownSpring = useSpring(dropdownActive ? 1 : 0)
    const dropdownRotationXTransform = useTransform(dropdownSpring, [0, 1], [10, 0])
    const dropdownRotationYTransform = useTransform(dropdownSpring, [0, 1], [20, 0])
    const dropdownTransitionTransform = useTransform(dropdownSpring, [0, 1], [-10, 7])
    const dropdownDropShadowTransform = useTransform(dropdownSpring, (x: number) => {
        return `0px 3px ${8 * x}px rgba(0, 0, 0, ${0.05 * x})`
    })
    const visibilityTransform = useTransform(dropdownSpring, (x: number) => {
        if (x <= 0.1) return `hidden`
        return `visible`
    })

    useEffect(() => {

        const hideDropdownOnOutsideClick = (e: any) => {
            if (buttonRef.current) {
                if (!buttonRef.current.contains(e.target)) setDropdownActive(false)
            }
        }

        window.addEventListener(`click`, hideDropdownOnOutsideClick)

        return () => {
            window.removeEventListener(`click`, hideDropdownOnOutsideClick)
        }
    }, [buttonRef])

    useEffect(() => {
        if (dropdownActive) dropdownSpring.set(1)
        else dropdownSpring.set(0)
    }, [dropdownActive])

    return (<div className="app-dropdown-button" ref={buttonRef}>
        <div className="label-container"
            style={{
                backgroundColor: background,
                color: textColor
            }}
            onClick={() => setDropdownActive(!dropdownActive)}
        >{text}</div>
        
        {/* Options container */}
        <motion.div 
            style={{
                rotateX: dropdownRotationXTransform,
                translateY: dropdownTransitionTransform,
                rotateY: dropdownRotationYTransform,
                perspective: `6.5cm`,
                opacity: dropdownSpring,
                visibility: visibilityTransform,
                boxShadow: dropdownDropShadowTransform
            }}
            className="options-container">
            {options.map((option_: DropdownOptionProps, i: number) => 
                <div className="option-item" 
                key={i} 
                onClick={() => { option_.onClick() }}>{option_.option}</div>
            )}
        </motion.div>
    </div>)
}

export default DropdownButton