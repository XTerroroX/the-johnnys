
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Immediate check on first render
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Run the check immediately
    checkMobile()
    
    // Set up listener for window resize events
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Use the standard addEventListener API with a named function for proper cleanup
    mql.addEventListener("change", checkMobile)
    
    // Clean up the event listener on component unmount
    return () => mql.removeEventListener("change", checkMobile)
  }, [])

  // Ensure we always return a boolean (default to false if undefined)
  return isMobile === undefined ? false : isMobile
}
