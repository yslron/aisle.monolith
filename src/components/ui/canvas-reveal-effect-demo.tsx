"use client";
import React from "react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";

export function CanvasRevealEffectDemo3({ animationSpeed = 1.0 }: { animationSpeed?: number }) {
    return (
        <div className="h-full w-full relative">
            <CanvasRevealEffect
                animationSpeed={animationSpeed}
                containerClassName="bg-transparent"
                colors={[
                    [247, 223, 22],   // Golden yellow
                    [255, 255, 100],  // Brighter yellow
                    [200, 180, 0],    // Darker yellow
                ]}
                opacities={[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
                dotSize={1}
                matrixMode={true}
                showGradient={false}
            />
            {/* Optional subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t pointer-events-none" />
        </div>
    );
}
