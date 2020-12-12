import React, {useState, useRef, useEffect} from 'react'
import {motion, useSpring, useTransform} from 'framer-motion'

import {useNumberCounter} from '../../hooks/useNumberCounter'

interface CollapsableTabProps {
    tab_name: string
    children: any
    count?: number
    collapsed?: boolean
    counter_on_end?: boolean
}

const CollapsableTab = ({tab_name, counter_on_end, count, 
    collapsed: _collapsed_, children}: CollapsableTabProps) => {

    const [collapsed, setCollapsed] = useState<boolean>(_collapsed_ != undefined ? _collapsed_ : false)
    const bodyRef = useRef<HTMLDivElement>(null)
    const counterRef_ = useNumberCounter({
        value: count ? count : 0,
        duration: 800
    })

    useEffect(() => {
        setCollapsed(_collapsed_ != undefined ? _collapsed_ : collapsed)
    }, [_collapsed_])

    useEffect(() => {
        console.log(`Collapsed Changed: ${collapsed}`)
        if (collapsed) {
            collapseInitSpring.set(0)
        }
        else {
            collapseEndSpring.set(1)
        }

        let unmountCollapseInitSpring = collapseInitSpring.onChange((x: number) => {
            if (x == 0) collapseEndSpring.set(0)
        })

        let unmountCollapseEndSpring = collapseEndSpring.onChange((x: number) => {
            if (x == 1) collapseInitSpring.set(1)
        })

        return () => {
            unmountCollapseInitSpring();
            unmountCollapseEndSpring();
        }
    }, [collapsed])

    const getvalue = (value: boolean) => value ? 0 : 1
    const collapseInitSpring = useSpring(_collapsed_ != undefined ? getvalue(_collapsed_) : getvalue(collapsed))

    const collapseEndSpring = useSpring(_collapsed_ != undefined ? getvalue(_collapsed_) : getvalue(collapsed))
    const bodyTranslate = useTransform(collapseEndSpring, (x: number) => {
        if (!bodyRef.current) return `0px`
        let bounds_ = bodyRef.current.getBoundingClientRect();
        return `${-1 * bounds_.height * (1 - x)}px`
    })
    const bodyVisibilityTransform = useTransform(collapseEndSpring, (x: number) => {
        if (x < 0.1) return `hidden`
        return `visible`
    })

    return (<div className={`collapsable-tab ${counter_on_end != undefined && counter_on_end ? 'at-end' : ''}`}>
        <div 
            onClick={() => setCollapsed(!collapsed)}
            className={`tab`}>{tab_name}
        {count && <div className="count">{counterRef_}</div>}
        </div>
        <motion.div 
            style={{
                opacity: collapseInitSpring,
                marginTop: bodyTranslate,
                visibility: bodyVisibilityTransform
            }}
        className="tab-body" ref={bodyRef}>{children}</motion.div>
    </div>)
}

export default CollapsableTab;