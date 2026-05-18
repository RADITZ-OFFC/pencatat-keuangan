import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [stage, setStage] = useState('enter')

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setStage('exit')
      const t = setTimeout(() => {
        setDisplayLocation(location)
        setStage('enter')
      }, 150)
      return () => clearTimeout(t)
    }
  }, [location, displayLocation])

  return (
    <div
      style={{
        opacity: stage === 'exit' ? 0 : 1,
        transform: stage === 'exit' ? 'translateY(6px)' : 'translateY(0)',
        transition: 'opacity 150ms ease, transform 150ms ease',
      }}
    >
      {children}
    </div>
  )
}
