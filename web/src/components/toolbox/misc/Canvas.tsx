import React, {useRef, useEffect, useState} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'

interface TranslatePosProps {
    start: {x: number, y: number}
    end: {x: number, y: number}
}

interface CanvasItem {
    component: any
    translatePos: TranslatePosProps
    width: number
    height: number
    zIndex: number
    delay?: number
    duration?: number
}

interface CanvasProps {
    items: CanvasItem[]
    show: boolean
}

const Canvas = ({
    items, show
}: CanvasProps) => {
    const canvasRef = useRef<HTMLDivElement>(null);

    const [_force_, __fUpdate_ ] = useState<boolean>(false);
    const fRef_ = useRef<boolean>(false);

    const forceUpdate = () => {
        __fUpdate_(!fRef_.current);
        fRef_.current = !fRef_.current;
    }

    useEffect(() => {

        if (show && canvasRef.current) {
            showCanvasSpring.set(1)
        }
        if (!show && canvasRef.current) {
            showCanvasSpring.set(0)
        }

    }, [show, canvasRef])

    useEffect(() => {

        const setCanvasDimensions = () => {
            if (canvasRef.current) {
                canvasRef.current.style.height = `${canvasRef.current.getBoundingClientRect().width}px`;
                forceUpdate();
            }
        }

        let t_1: null | NodeJS.Timeout = null;
        let t_2: null | NodeJS.Timeout = null;
        let t_3: null | NodeJS.Timeout = null;
        if (canvasRef.current) {
            t_1 = setTimeout(() => {setCanvasDimensions()}, 50);
            t_2 = setTimeout(() => {setCanvasDimensions()}, 100);
            t_3 = setTimeout(() => {setCanvasDimensions()}, 200);
        }

        window.addEventListener(`resize`, setCanvasDimensions)

        return () => {
            window.removeEventListener(`resize`, setCanvasDimensions)
            if (t_1 != null) clearTimeout(t_1);
            if (t_2 != null) clearTimeout(t_2);
            if (t_3 != null) clearTimeout(t_3);
        }
    }, [canvasRef])

    const showCanvasSpring = useSpring(0)

    const getScale = (): number => {
        if (!canvasRef.current) return 0;
        return canvasRef.current.getBoundingClientRect().width;
    }

    const getWidth = (item: CanvasItem) => `${ item.width *  getScale()}px`
    const getHeight = (item: CanvasItem) => `${ item.height *  getScale()}px`
    const getX = (item: CanvasItem, start: boolean) => `${(start ? item.translatePos.start.x : item.translatePos.end.x) * getScale()}px`
    const getY = (item: CanvasItem, start: boolean) => `${(start ? item.translatePos.start.y : item.translatePos.end.y) * getScale()}px`

    const drawCanvas = () => {
        return items.map((item_: CanvasItem, i: number) => {
            return (<MotionObject key={i} item_={item_} show={show} scale={getScale()} />)
        })
    }

    return (<motion.div className="_canvas_ no-select" 
        ref={canvasRef}>
        {drawCanvas ()}
    </motion.div>)
}

const MotionObject = ({item_, scale, show}: {show: boolean, scale: number, item_: CanvasItem}) => {

    const getWidth = (item: CanvasItem) => `${ item.width *  scale}px`
    const getHeight = (item: CanvasItem) => `${ item.height *  scale}px`
    const getX = (item: CanvasItem, start: boolean) => (start ? item.translatePos.start.x : item.translatePos.end.x) * scale;
    const getY = (item: CanvasItem, start: boolean) => (start ? item.translatePos.start.y : item.translatePos.end.y) * scale;

    useEffect(() => {
        let t_1 : null | NodeJS.Timeout = null
        if (show) {
            if (item_.delay) {
                t_1 = setTimeout(() => {showSpring.set(1)}, item_.delay)
            }
            else {
                showSpring.set(1)
            }
        }
        else showSpring.set(0)

        return () => {
            if (t_1 != null) clearTimeout(t_1);
        }
    }, [show])

    const showSpring = useSpring(0, {duration: item_.duration? item_.duration : undefined})
    const translateXTransform = useTransform(showSpring, (x: number): string => {
        let x_ = getX(item_, true);//.translatePos.start.x
        let x_e = getX(item_, false); // item_.translatePos.end.x
        return `calc(-50% + ${ x_ + ((x_e - x_)*x) }px)`
    });
    const translateYTransform = useTransform(showSpring, (x: number): string => {
        let y_ = getY(item_, true);// .translatePos.start.y
        let y_e = getY(item_, false); //item_.translatePos.end.y
        return `calc(-50% + ${ y_ + ((y_e - y_)*x) }px)`
    });

    return (<motion.div style={{
        width: getWidth(item_),
        height: getHeight(item_),
        // border: `1px solid orange`,
        // transform: `translate(-50%, -50%)`,
        translateX: translateXTransform,
        translateY: translateYTransform,
        position: `absolute`,
        zIndex: item_.zIndex,
        opacity: showSpring
    }}>
        <img src={item_.component} 
            className="no-select"
            style={{
            width: `100%`,
            height: `100%`
        }} />
    </motion.div>)
}

export default Canvas;