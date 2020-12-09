import React, {useRef, useEffect} from 'react'

/**
 * useContainerRef: creates and returns a ref.
 * As a side effect, the div element assigned to this ref
 * will have its dimensions resized to fill the height of the
 * body of a document page.
 */
export const useContainerRef = ({ref_}: {ref_: React.RefObject<HTMLDivElement | undefined>}) => {

    const setHeight = () => {
        if (!ref_.current) return;
        let h_ = document.documentElement.clientHeight - (ref_.current.getBoundingClientRect().top + 20)
        ref_.current.style.height = `${h_}px`
        ref_.current.style.overflowY = "scroll"
    }

    useEffect(() => {

        const updateHeight = () => setHeight()

        setHeight();
        let c_1 = setTimeout(updateHeight, 10)
        let c_2 = setTimeout(updateHeight, 100)
        let c_3 = setTimeout(updateHeight, 200)
        let c_4 = setTimeout(updateHeight, 500)
        let c_5 = setTimeout(updateHeight, 1000)
        window.addEventListener(`resize`, updateHeight)
        return () => {
            window.removeEventListener(`resize`, updateHeight)
            clearTimeout(c_1)
            clearTimeout(c_2)
            clearTimeout(c_3)
            clearTimeout(c_4)
            clearTimeout(c_5)
        }
    }, [ref_])

    return ref_;
}