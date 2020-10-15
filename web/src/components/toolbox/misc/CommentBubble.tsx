import React from 'react'

interface ICommentBubble {
  message: string
  header: string
  action?: string
  onActionClick?: Function
}

const CommentBubble = ({
  message, header, action, onActionClick
}: ICommentBubble) => {

  return (<div className="comment-bubble">
    <div
    style={{
      fontWeight: 600,
      textTransform: 'uppercase',
      fontSize: '0.7rem',
      marginBottom: '10px'
    }}
    >{header}</div>

    <div 
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row'
    }}>
      <div>{message}</div>
      {
        action &&
        <div 
        className="action-button"
        onClick={() => {
          if (onActionClick) onActionClick()
        }}>{action}</div>
      }
    </div>
  </div>)
}

export default CommentBubble