import React, { useEffect, useState } from 'react'

interface CommentBubbleProps {
    parentRef: React.RefObject<HTMLElement>
}

const CommentBubble = ({parentRef}: CommentBubbleProps) => {
    
    const [parentBounds, setParentBounds] = useState<Partial<DOMRect>>({})
    const [showCommentBubble, setShowCommentBubble] = useState<boolean>(false)

    useEffect(() => {
        if (parentRef.current) {
            parentRef.current.addEventListener(`mouseover`, initBubble)
            parentRef.current.addEventListener(`mouseout`, closeBubble)
        }

        return () => {
            if (parentRef.current) {
                parentRef.current.addEventListener(`mousemove`, initBubble)
                parentRef.current.addEventListener(`mouseout`, closeBubble)
            }
        }
    }, [parentRef])

    const initBubble = () => {
        if (!parentRef.current) return;
        setParentBounds(parentRef.current.getBoundingClientRect())
        setShowCommentBubble(true)
    }
    const closeBubble = () => {
        setShowCommentBubble(false)
    }

    const getLeft = (): string => parentBounds.left && parentBounds.width? `${(parentBounds.width / 2)}px` : ``;

    const getTop = (): string => parentBounds.top && parentBounds.height? `${(parentBounds.height / 2)}px` : ``;

    return (<React.Fragment>
        {showCommentBubble && 
        <div className="comment-bubble-2"
        style={{
            left: getLeft(),
            top: getTop()
        }}>Sample</div>}
    </React.Fragment>)
}

export default CommentBubble