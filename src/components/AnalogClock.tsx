'use client'

import { useState, useEffect } from 'react'

interface AnalogClockProps {
    size?: number
}

export default function AnalogClock({ size = 400 }: AnalogClockProps) {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    // Calculate angles for the hands
    const hours = time.getHours() % 12
    const minutes = time.getMinutes()
    const seconds = time.getSeconds()

    // Convert to degrees (360° = 12 hours, 60 minutes, 60 seconds)
    const hourAngle = (hours * 30) + (minutes * 0.5) // 30° per hour + minute adjustment
    const minuteAngle = minutes * 6 // 6° per minute
    const secondAngle = seconds * 6 // 6° per second

    // Scale dimensions based on size
    const center = size / 2
    const radius = (size / 2) - 10
    const minuteHandLength = 38
    const hourHandLength = 50
    const secondHandLength = 55
    const centerSquareSize = size * 0.05

    return (
        <div className="relative">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} >
                {/* Clock face circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="#F7DF16"
                    stroke="#000"
                    strokeWidth={1}
                />

          

                {/* Minute hand */}
                <line
                    x1={center}
                    y1={center}
                    x2={center + Math.sin(minuteAngle * Math.PI / 180) * minuteHandLength}
                    y2={center - Math.cos(minuteAngle * Math.PI / 180) * minuteHandLength}
                    stroke="#000"
                    strokeWidth={Math.max(2, size * 0.01)}
                    strokeLinecap="square"
                />

                {/* Hour hand */}
                <line
                    x1={center}
                    y1={center}
                    x2={center + Math.sin(hourAngle * Math.PI / 180) * hourHandLength}
                    y2={center - Math.cos(hourAngle * Math.PI / 180) * hourHandLength}
                    stroke="#000"
                    strokeWidth={2}
                    strokeLinecap="square"
                />

                {/* Second hand */}
                <line
                    x1={center}
                    y1={center}
                    x2={center + Math.sin(secondAngle * Math.PI / 180) * secondHandLength}
                    y2={center - Math.cos(secondAngle * Math.PI / 180) * secondHandLength}
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeLinecap="square"
                />

                {/* Center square */}
                <rect
                    x={center - centerSquareSize / 2}
                    y={center - centerSquareSize / 2}
                    width={centerSquareSize}
                    height={centerSquareSize}
                    fill="#000"
                />
            </svg>
        </div>
    )
} 