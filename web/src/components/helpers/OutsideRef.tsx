import React, {useEffect} from 'react'

const useOutsideAlerter = (ref: React.RefObject<any>, onClick: (e: MouseEvent, dependency?: any) => void, dependency: any) => {
  useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      const handleOutsideClcik = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target)) {
          onClick (e, dependency)
      }
      }

      // Bind the event listener
      document.addEventListener("mousedown", handleOutsideClcik);
      return () => {
          // Unbind the event listener on clean up
          document.removeEventListener("mousedown", handleOutsideClcik);
      };
  }, [ref, dependency]);
}

export {useOutsideAlerter}