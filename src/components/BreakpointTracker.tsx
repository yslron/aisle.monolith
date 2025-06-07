'use client'

import { useBreakpoint } from '@/hooks/use-breakpoint'

export default function Test() {
    const { breakpoint, width, isMobile, isTablet, isDesktop, isUltrawide } = useBreakpoint()
    const height = window.innerHeight
    const getBadgeColor = () => {
        if (isMobile) return 'bg-red-100 text-red-800'
        if (isTablet) return 'bg-yellow-100 text-yellow-800'
        if (isDesktop) return 'bg-green-100 text-green-800'
        return 'bg-blue-100 text-blue-800'
    }

    return (
        <div className='absolute w-full top-0 left-0  flex justify-center items-center px-2'>
            <div className="h-[20px] mt-0.5 border border-l  border-black/40" />
            <div className="w-full border-b  border-black/40 h-[4px]" />
            <div className='bg-black px-1 py-1 relative flex flex-row'>

                <div className='flex gap-2 text-nowrap text-base'>
                    <span className={`px-1 py-1 text-xs font-medium ${getBadgeColor()}`}>
                        {breakpoint}
                    </span>
                    <h1 className='text-white'>x {width} / y {height} </h1>
                </div>
                <div className="w-full h-[1px]"></div>
            </div>
           
            <div className="w-full border-b  border-black/40 h-[4px]" />
            <div className="h-[20px] mt-0.5 border border-r  border-black/40" />
        </div>
    )
}