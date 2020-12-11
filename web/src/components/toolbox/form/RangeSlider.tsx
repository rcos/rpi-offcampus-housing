import React, {useState, useRef, useEffect} from 'react';
import {motion, useSpring, useTransform} from 'framer-motion';
import { numbersOnly } from './Input';

interface SliderBounds {
    left: number
    right: number
}

interface SliderProps {
    onChange?: (left_ratio: number, right_ratio: number) => void
    range: {start: number, end: number}
    toStr?: (value: any) => string
    updateDimensionTrigger?: any
    forceUpdate?: any
}

const RangeSlider = ({ range, toStr, forceUpdate, updateDimensionTrigger, onChange }: SliderProps) => {

    const [sliderBounds, setSliderBounds] = useState<SliderBounds>({left: 0, right: 0})
    const sliderPositinsRef = useRef<{left: number, right: number}>({left: 0, right: 0})
    const [sliderPositionsState, setSliderPositionsState] = useState<{left: number, right: number}>({left: 0, right: 20})

    const sliderContainerRef = useRef<HTMLDivElement>(null)
    const [sliding, setSliding] = useState<boolean>(false)
    const sliderValuesRef = useRef<{left: number, right: number}>({left: 0, right: 0})

    useEffect(() => {
        // initialize the slider's bounds
        if (sliderContainerRef.current) {
            updateBounds()

            // set the intial sliderPositionsRef
            let bounds_ = sliderContainerRef.current.getBoundingClientRect();
            sliderValuesRef.current = {
                left: sliderPositionsState.left / (bounds_.right - bounds_.left),
                right: sliderPositionsState.right / (bounds_.right - bounds_.left),
            }
        }
        window.addEventListener('resize', updateBounds)
        return () => {
            window.removeEventListener('resize', updateBounds)
        }
    }, [sliderContainerRef, forceUpdate])

    const updateBounds = () => {
        if (!sliderContainerRef.current) return;
        let bounds_ = sliderContainerRef.current.getBoundingClientRect();
        let old_bounds = sliderBounds;

        let left_ratio = clamp(sliderPositionsState.left / (old_bounds.right - old_bounds.left), 0, 1);
        let right_ratio = clamp(sliderPositionsState.right / (old_bounds.right - old_bounds.left), 0, 1);

        let new_left = left_ratio * (bounds_.right - bounds_.left)
        let new_right = right_ratio * (bounds_.right - bounds_.left)

        setSliderBounds({
            left: bounds_.left,
            right: bounds_.right
        })
    }

    const initSlide = (slider: string) => {
        updateBounds()
        setSliding(true)
        document.addEventListener('mousemove', slider == 'left'? moveLeftSlider : moveRightSlider);
        document.addEventListener('mouseup', endSlide)
    }

    const getMinRange = () =>  (sliderBounds.right-sliderBounds.left) * 0.05
    const clamp = (val: number, min_: number, max_: number) => Math.min(max_, Math.max(val, min_))
    const moveLeftSlider = (e: MouseEvent) => moveSlider(e, "left")
    const moveRightSlider = (e: MouseEvent) => moveSlider(e, "right")
    const moveSlider = (e: MouseEvent, slider: string) => {
        if (!sliderContainerRef.current) return;
        let sliderBounds_: {left: number, right: number} = sliderContainerRef.current.getBoundingClientRect();
        let new_val = clamp(e.clientX - sliderBounds_.left, 0, sliderBounds_.right - sliderBounds_.left);

        let slider_width = (sliderBounds_.right-sliderBounds_.left)
        let new_positions = {...sliderPositionsState}
        if (slider == 'left') {
            let right_slider_pos = sliderValuesRef.current.right * slider_width
            new_positions.left = Math.min(clamp(new_val, 0, slider_width), right_slider_pos - getMinRange())

            sliderValuesRef.current.left = new_positions.left / (sliderBounds_.right - sliderBounds_.left);
        }
        if (slider == 'right') {
            let left_slider_pos = sliderValuesRef.current.left * slider_width
            new_positions.right = Math.max(clamp(new_val, 0, slider_width), left_slider_pos + getMinRange())

            sliderValuesRef.current.right = new_positions.right / (sliderBounds_.right - sliderBounds_.left);
        }
        setSliderPositionsState(new_positions)
        sliderPositinsRef.current = new_positions
    }

    const endSlide = () => {
        document.removeEventListener('mousemove', moveLeftSlider);
        document.removeEventListener('mousemove', moveRightSlider);
        document.removeEventListener('mouseup', endSlide);
        setSliding(false);
        setShowBubble(false);

        // sliderPositinsRef.current = sliderPositionsState

        if (onChange) {
            onChange(sliderValuesRef.current.left, sliderValuesRef.current.right)
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

    const showPointerSpring = useSpring(0, {duration: 250})
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

    const getValue = (slider: 'left' | 'right') => getValueAt(sliderValuesRef.current[slider])
    

    const getValueAt = (ratio: number) => {
        let val_ = (range.end - range.start) * ratio
        if (toStr) return toStr(val_)
        return val_
    }
    const sliderWidth = () => {
        if (!sliderContainerRef.current) return 0;
        let sliderBounds_ = sliderContainerRef.current.getBoundingClientRect();
        return Math.max(0, sliderBounds_.right - sliderBounds_.left)
    }

    useEffect(() => {
    }, [updateDimensionTrigger])

    return (<div className="form-input-slider" ref={sliderContainerRef}>

            <div className="slider-range-filler"
                style={{
                    left: `${sliderPositionsState.left}px`,
                    right: `${sliderWidth() - sliderPositionsState.right}px`
                }}
            />

            {/* Left */}
            <div className="slider-ctrl" 
                onMouseOver={initBubble}
                onMouseOut={killBubble}
                onMouseDown={() => {initSlide('left')}} style={{
                left: `${sliderPositionsState.left}px`
            }}>
                <motion.div className="text-bubble"
                    style={{
                        opacity: showBubbleSpring,
                        scale: scaleBubbleTransform,
                        translateX: `var(--translate-x)`,
                        rotateZ: rotateBubbleTransform
                    }}
                >{getValue('left')}<motion.div className="triangle-ptr" 
                    style={{
                        bottom: pointerTranslateTransform,
                        opacity: showPointerSpring
                    }}
                /></motion.div>
            </div>

            {/* Right */}
            <div className="slider-ctrl" 
                onMouseOver={initBubble}
                onMouseOut={killBubble}
                onMouseDown={() => {initSlide('right')}} style={{
                left: `${sliderPositionsState.right}px`
            }}>
                <motion.div className="text-bubble"
                    style={{
                        opacity: showBubbleSpring,
                        scale: scaleBubbleTransform,
                        translateX: `var(--translate-x)`,
                        rotateZ: rotateBubbleTransform
                    }}
                >{getValue('right')}<motion.div className="triangle-ptr" 
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

export default RangeSlider;