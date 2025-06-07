'use client'

import { useState, useEffect } from 'react'

export type Breakpoint = 'mobile sm' | 'tablet md' | 'desktop lg' | 'ultrawide - xl'

interface UseBreakpointReturn {
  breakpoint: Breakpoint
  width: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isUltrawide: boolean
}

const getBreakpoint = (width: number): Breakpoint => {
  if (width >= 3440) return 'ultrawide - xl'
  if (width >= 1440) return 'desktop lg'
  if (width >= 1024) return 'tablet md'
  return 'mobile sm'
}

export function useBreakpoint(): UseBreakpointReturn {
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Set initial width
    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const breakpoint = getBreakpoint(windowWidth)

  return {
    breakpoint,
    width: windowWidth,
    isMobile: breakpoint === 'mobile sm',
    isTablet: breakpoint === 'tablet md',
    isDesktop: breakpoint === 'desktop lg',
    isUltrawide: breakpoint === 'ultrawide - xl'
  }
} 