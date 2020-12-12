import React, {useState, useRef, useEffect} from 'react';
import {motion, useSpring, useTransform} from 'framer-motion';

interface SliderBounds {
    left: number
    right: number
}

interface SliderProps {
    onChange?: (ratio: number) => void
    range: {start: number, end: number}
    toStr?: (value: any) => string
    forceUpdate?: any
}

const Slider = ({ range, forceUpdate, toStr, onChange }: SliderProps) => {

    const [sliderBounds, setSliderBounds] = useState<SliderBounds>({left: 0, right: 0})
    const [sliderX, setSliderX] = useState<number>(0)
    const sliderContainerRef = useRef<HTMLDivElement>(null)
    const [sliding, setSliding] = useState<boolean>(false)
    const sliderValueRef = useRef<number>(0)

    useEffect(() => {updateBounds()}, [forceUpdate])

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
        if (!sliderContainerRef.current) return;
        let sliderBounds_ = sliderContainerRef.current.getBoundingClientRect();
        let new_val = Math.max(Math.min(e.clientX - sliderBounds_.left, sliderBounds_.right - sliderBounds_.left), 0)
        sliderValueRef.current = new_val / (sliderBounds_.right - sliderBounds_.left);
        setSliderX(new_val)
    }

    const endSlide = () => {
        document.removeEventListener('mousemove', moveSlider);
        document.removeEventListener('mouseup', endSlide);
        setSliding(false);
        setShowBubble(false);

        if (onChange) {
            onChange(sliderValueRef.current)
        }
    }

    const initBubble = () => {
        setShowBubble(true)
    }
    const killBubble = () => {
        if (sliding) {}
        else setShowBubble(false)
    }

    const showNumberLine = () => {
        let divisions = Math.floor((sliderBounds.right - sliderBounds.left) / 80)
        return Array.from(new Array(divisions), (_: any, i: number) => {
            let ratio = ((1 / divisions) * i) + (1/(2 * divisions))
            return (<div key={i} 
                style={{width: `${100/divisions}%`}}
                className={`number ${i == 0 ? 'first' : ''}`}>{getValueAt(ratio)}</div>)
        })
    }

    const [showBubble, setShowBubble] = useState<boolean>(false)
    const showBubbleSpring = useSpring(0, {stiffness: 150})
    const scaleBubbleTransform = useTransform(showBubbleSpring, [0, 1], [0.5, 1])
    const rotateBubbleTransform = useTransform(showBubbleSpring, [0, 1], [-25, 0], {clamp: false})

    const showPointerSpring = useSpring(0, {duration: 200})
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

    const getValue = () => getValueAt(sliderValueRef.current)
    

    const getValueAt = (ratio: number) => {
        let val_ = (range.end - range.start) * ratio
        if (toStr) return toStr(val_)
        return val_
    }

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
                >{getValue()}<motion.div className="triangle-ptr" 
                    style={{
                        bottom: pointerTranslateTransform,
                        opacity: showPointerSpring
                    }}
                /></motion.div>
            </div>

            {/* Number Line */}
            <div className="number-line">
                {showNumberLine()}
            </div>
    </div>)
}

export default Slider;