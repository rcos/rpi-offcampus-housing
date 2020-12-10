import React, {useState, useRef, useEffect} from 'react';
import {motion, useSpring, useTransform} from 'framer-motion';

interface SliderBounds {
    left: number
    right: number
}

const Slider = () => {

    const [sliderBounds, setSliderBounds] = useState<SliderBounds>({left: 0, right: 0})
    const [sliderX, setSliderX] = useState<number>(0)
    const sliderContainerRef = useRef<HTMLDivElement>(null)
    const [sliding, setSliding] = useState<boolean>(false)

    useEffect(() => {
        // initialize the slider's bounds
        if (sliderContainerRef.current) {
            updateBounds()
        }
        window.addEventListener('resize', updateBounds)
        return () => {
            window.removeEventListener('resize', updateBounds)
        }
    }, [sliderContainerRef])

    const updateBounds = () => {
        if (!sliderContainerRef.current) return;
        let bounds_ = sliderContainerRef.current.getBoundingClientRect();
        console.log(`Bounds`, bounds_)
        setSliderBounds({
            left: bounds_.left,
            right: bounds_.right
        })
    }

    const initSlide = () => {
        setSliding(true)
        document.addEventListener('mousemove', moveSlider);
        document.addEventListener('mouseup', endSlide)
    }

    const moveSlider = (e: MouseEvent) => {
        let new_val = Math.max(Math.min(e.clientX - sliderBounds.left, sliderBounds.right - sliderBounds.left), 0)
        setSliderX(new_val)
    }

    const endSlide = () => {
        document.removeEventListener('mousemove', moveSlider);
        document.removeEventListener('mouseup', endSlide);
        setSliding(false);
        setShowBubble(false);
    }

    const initBubble = () => {
        setShowBubble(true)
    }
    const killBubble = () => {
        if (sliding) {}
        else setShowBubble(false)
    }

    const [showBubble, setShowBubble] = useState<boolean>(false)
    const showBubbleSpring = useSpring(0, {stiffness: 150})
    const scaleBubbleTransform = useTransform(showBubbleSpring, [0, 1], [0.5, 1])
    const rotateBubbleTransform = useTransform(showBubbleSpring, [0, 1], [-25, 0], {clamp: false})

    const showPointerSpring = useSpring(0)
    const pointerTranslateTransform = useTransform(showPointerSpring, [0, 1], [0, -6.5])

    useEffect(() => {

        if (showBubble) showBubbleSpring.set(1)
        else showPointerSpring.set(0)

        let unsubShowBubbleSpring = showBubbleSpring.onChange((x: number) => {
            if (x==1) showPointerSpring.set(1)
        })

        let unsubShowPointerSpring = showPointerSpring.onChange((x: number) => {
            if (x==0) showBubbleSpring.set(0)
        })

        return () => {
            unsubShowBubbleSpring()
            unsubShowPointerSpring()
        }
    }, [showBubble])

    return (<div className="form-input-slider" ref={sliderContainerRef}>
            <div className="slider-ctrl" 
                onMouseOver={initBubble}
                onMouseOut={killBubble}
                onMouseDown={initSlide} style={{
                left: `${sliderX}px`
            }}>
                <motion.div className="text-bubble"
                    style={{
                        opacity: showBubbleSpring,
                        scale: scaleBubbleTransform,
                        translateX: `var(--translate-x)`,
                        rotateZ: rotateBubbleTransform
                    }}
                >Sample Input 123<motion.div className="triangle-ptr" 
                    style={{
                        bottom: pointerTranslateTransform,
                        opacity: showPointerSpring
                    }}
                /></motion.div>
            </div>
    </div>)
}

export default Slider;