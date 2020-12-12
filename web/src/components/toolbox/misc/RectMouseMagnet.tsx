import React, {useRef} from 'react'

interface RectMouseMagnetProps {
    children: any
    rotateXStrength?: number
    rotateYStrength?: number
    shadowStrength?: number
}

const RectMouseManget = ({ children, shadowStrength, rotateXStrength, rotateYStrength }: RectMouseMagnetProps) => {

    const rectRef = useRef<HTMLDivElement>(null)

    const initTransform = () => {
        window.addEventListener(`mouseout`, endTransform)
        window.addEventListener(`mousemove`, handleTransform)
    }

    const getYRotation = () => {
        if (rotateYStrength != undefined) return rotateYStrength;
        if (!rectRef.current) return 0;
        let bounds_: DOMRect = rectRef.current.getBoundingClientRect();
        return bounds_.width * 0.03;
    }

    const getXRotation = () => {
        if (rotateXStrength != undefined) {
            return rotateXStrength;
        }
        if (!rectRef.current) return 0;
        let bounds_: DOMRect = rectRef.current.getBoundingClientRect();
        return bounds_.height * 0.03;
    }

    const getShadowStrength = () => shadowStrength == undefined ? 0.1 : shadowStrength
    const getDistanceFromEdge = (x_val: number, y_val: number) => {
        let c_ = Math.pow(x_val, 2) + Math.pow(x_val, 2)
        return c_/2
    }

    const handleTransform = (e: MouseEvent) => {
        if (!rectRef.current) return;
        let bounds_: DOMRect = rectRef.current.getBoundingClientRect();

        let r_x = 2 * (((e.x - bounds_.left) / (bounds_.right - bounds_.left)) - 0.5);
        let r_y = 2 * (((e.y - bounds_.top) / (bounds_.bottom - bounds_.top)) - 0.5);
        rectRef.current.style.transform 
        = `perspective(6.5cm) rotateX(${(getXRotation()) * r_y}deg) rotateY(${(getYRotation()) * -1 * r_x}deg)`;
        rectRef.current.style.boxShadow = `${r_x * 5}px ${r_y * 5}px 10px rgba(59, 67, 83, ${getDistanceFromEdge(r_x, r_y) * getShadowStrength()})`;
    }

    const endTransform = () => {
    
        if (rectRef.current) {
            rectRef.current.style.transform = `perspective(6.5cm) rotateX(0deg) rotateY(0deg)`;
            rectRef.current.style.boxShadow = `0px 0px 3.5px rgba(0, 0, 0, 0)`;
        }
        window.removeEventListener(`mousemove`, handleTransform)
        window.removeEventListener(`mouseout`, endTransform)
    }

    return (<div ref={rectRef} 
        style={{
            transition: `transform 0.15s, box-shadow 0.35s`
        }}
        onMouseOver={initTransform}
    >{children}</div>)
}

export default RectMouseManget