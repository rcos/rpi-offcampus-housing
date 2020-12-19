import React, { useEffect } from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'
import {Link} from 'react-router-dom'

interface DramaticButtonProps {
    text: string
    background: string
    background2: string
    background3: string
    show: boolean
    initial?: boolean
    linkTo: string
}

const DramaticButton = ({text, initial, linkTo, show, background, background2, background3}: DramaticButtonProps) => {

    useEffect(() => {
        let t_1: null | NodeJS.Timeout= null;
        let t_2: null | NodeJS.Timeout = null;

        if (show == true) {
            rectExpandSpring1.set(1)
            t_1 = setTimeout(() => { rectExpandSpring2.set(1) }, 200)
            t_2 = setTimeout(() => { rectExpandSpring3.set(1) }, 400)
        }
        else {
            rectExpandSpring3.set(0)
            t_1 = setTimeout(() => { rectExpandSpring2.set(0) }, 200)
            t_2 = setTimeout(() => { rectExpandSpring1.set(0) }, 400)
        }

        let unmountRectExpandSpring3 = rectExpandSpring3.onChange((x: number) => {
            if (x == 1) {
                textShowSpring.set(1)
            }
        })

        return () => {
            unmountRectExpandSpring3();
            if (t_1 != null) clearTimeout(t_1);
            if (t_2 != null) clearTimeout(t_2);
        }
    }, [show])

    const rectExpandSpring1 = useSpring(0)
    const rectWidthTransform1 = useTransform(rectExpandSpring1, (x: number) => `${x * 100}%`)
    const rectExpandSpring2 = useSpring(0)
    const rectWidthTransform2 = useTransform(rectExpandSpring2, (x: number) => `${x * 100}%`)
    const rectExpandSpring3 = useSpring(0)
    const rectWidthTransform3 = useTransform(rectExpandSpring3, (x: number) => `${x * 100}%`)

    const textShowSpring = useSpring(0)

    return (<Link to={linkTo}><div className="dramatic-button" style={{
    }}>
        <motion.div className="text-holder_"
            style={{
                opacity: textShowSpring
            }}
        >{text}</motion.div>

        <motion.div className="rect-expand" 
            style={{
                backgroundColor: background3,
                width: rectWidthTransform1
            }}
        />
        <motion.div className="rect-expand" 
            style={{
                backgroundColor: background2,
                width: rectWidthTransform2
            }}
        />
        <motion.div className="rect-expand" 
            style={{
                backgroundColor: background,
                width: rectWidthTransform3
            }}
        />
    </div></Link>)
}

export default DramaticButton