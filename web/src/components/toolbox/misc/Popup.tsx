import React, {useRef, useEffect} from 'react'
import {HiX} from 'react-icons/hi'
import Button from '../form/Button'
import {motion, useSpring, useTransform} from 'framer-motion'

interface PopupProps {
    show: boolean
    children: any
    width: string | number
    height: string | number
}

const Popup = ({show, width, height, children}: PopupProps) => {
    const popupRef = useRef<HTMLDivElement>(null)

    const initPopupSpring = useSpring(0)
    const popupVisibilityTransform = useTransform(initPopupSpring, (x: number) => {
        if (x <= 0.1) return `hidden`
        return `visible`
    })

    const showContentsSpring = useSpring(0)


    useEffect(() => {

        if (show) initPopupSpring.set(1)
        else showContentsSpring.set(0)

        let unmountInitPopupSpring = initPopupSpring.onChange((x: number) => {
            if (x == 1) showContentsSpring.set(1)
        })
        let unmountShowContentsSrping = showContentsSpring.onChange((x: number) => {
            if (x == 0) initPopupSpring.set(0)
        })

        return () => {
            unmountInitPopupSpring()
            unmountShowContentsSrping()
        }
    }, [show])

    return (<motion.div 
        style={{
            opacity: initPopupSpring,
            visibility: popupVisibilityTransform
        }}
        className="popup-2" ref={popupRef}>
        <motion.div className="popup-container-2"
            style={{
                width: `${width}px`,
                height: `${height}px`,
                opacity: showContentsSpring
            }}
        >
            {children}
        </motion.div>
    </motion.div>)
}

export const PopupHeader = ({children, 
    withClose,
    onClose}: {children: any, withClose?: boolean, onClose?: Function}) => {
    return (<div className="popup-header_">
        <div className="header-txt">{children}</div>
        {withClose && <div className="close_" onClick={onClose? () => onClose() : () => {}}>
            <HiX />
        </div>}
    </div>)
}

export const ConfirmLine = ({
    withCancel,
    onConfirm,
    onCancel,
    confirmButtonText
}: {withCancel?: boolean, confirmButtonText?: string, onConfirm?: Function, onCancel?: Function}) => {

    return (<React.Fragment>
            <div style={{height: `60px`}} />
            <div className="confirm-line">
            {withCancel && <div className="cancel_">
                <Button text="Cancel"
                onClick={onCancel}
                background="#DDDEE0" textColor="black" />    
            </div>}
            <div className="confirm_">
                <Button text={confirmButtonText ? confirmButtonText : `Confirm`} 
                onClick={onConfirm}
                background="#6AD68B" textColor="white" />
            </div>
        </div>
    </React.Fragment>)
}

export default Popup