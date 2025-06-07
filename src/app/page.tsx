"use client"
import NavBar from "@/components/NavBar";
import Image from "next/image";
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { CanvasRevealEffectDemo3 } from "@/components/ui/canvas-reveal-effect-demo";
import AnalogClock from "@/components/AnalogClock";

function scrambleText(target: HTMLHeadingElement, text: string, duration: number = 4.2) {
  const chars = '!<>-_\/[]{}—=+*^?#________'
  let frame = 0
  let scrambled = ''
  let queue: Array<{ from: string, to: string, start: number, end: number }> = []
  const totalFrames = Math.round(duration * 60)
  for (let i = 0; i < text.length; i++) {
    const start = Math.floor(Math.random() * (totalFrames * 0.4))
    const end = start + Math.floor(Math.random() * (totalFrames * 0.6))
    queue.push({
      from: '',
      to: text[i],
      start,
      end
    })
  }
  function randomChar() {
    return chars[Math.floor(Math.random() * chars.length)]
  }
  function update() {
    scrambled = ''
    let complete = 0
    for (let i = 0; i < queue.length; i++) {
      let { from, to, start, end } = queue[i]
      if (frame >= end) {
        scrambled += to
        complete++
      } else if (frame >= start) {
        scrambled += randomChar()
      } else {
        scrambled += ' '
      }
    }
    target.textContent = scrambled
    if (complete === queue.length) return
    frame++
    requestAnimationFrame(update)
  }
  update()
}

function ScrambleHeadings({ duration = 4.2 }: { duration?: number }) {
  const texts = ['/VODING.DEV', 'PINYA.IO', 'MONOLITH.CRM', 'PERSONATASK']
  const refs = [
    useRef<HTMLHeadingElement>(null),
    useRef<HTMLHeadingElement>(null),
    useRef<HTMLHeadingElement>(null),
    useRef<HTMLHeadingElement>(null)
  ]

  // Helper to split text into spans
  function renderSpans(text: string, idx: number) {
    return text.split('').map((char, i) => (
      <span
        key={i}
        className="text-muted transition-colors duration-300"
        data-letter-idx={i}
        data-heading-idx={idx}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))
  }

  useEffect(() => {
    refs.forEach((ref, i) => {
      if (ref.current) scrambleText(ref.current, texts[i], duration)
    })
  }, [duration])

  // Hover effect: reveal color per letter left to right and glitch text
  function handleMouseEnter(idx: number) {
    const heading = refs[idx].current
    if (!heading) return
    const spans = heading.querySelectorAll('span')
    // Color reveal
    gsap.to(spans, {
      color: 'var(--color-secondary)',
      stagger: 2 / spans.length,
      duration: 2,
      overwrite: 'auto',
      ease: 'power1.inOut'
    })
    // Glitch effect: scramble text for 0.4s, then restore
    const original = texts[idx]
    let glitching = true
    let frame = 0
    function glitch() {
      if (!glitching || !heading) return
      scrambleText(heading, original, 0.1)
      frame++
      if (frame < 4) {
        setTimeout(glitch, 20)
      } else if (heading) {
        heading.innerHTML = ''
        original.split('').forEach((char, i) => {
          const span = document.createElement('span')
          span.className = 'text-secondary transition-colors duration-300'
          span.textContent = char === ' ' ? '\u00A0' : char
          heading.appendChild(span)
        })
        glitching = false
      }
    }
    glitch()
  }
  function handleMouseLeave(idx: number) {
    const heading = refs[idx].current
    if (!heading) return
    const spans = heading.querySelectorAll('span')
    gsap.to(spans, {
      color: 'var(--color-muted)',
      duration: 0.4,
      overwrite: 'auto',
      ease: 'power1.inOut'
    })
  }

  return (
    <>
      {texts.map((text, idx) => (
        <h2
          key={text}
          ref={refs[idx]}
          className="mask-x-from-0 hover:cursor-pointer hover:mask-none transition-all duration-300 text-secondary font-light text-5xl"
          onMouseEnter={() => handleMouseEnter(idx)}
          onMouseLeave={() => handleMouseLeave(idx)}
        >
          {renderSpans(text, idx)}
        </h2>
      ))}
    </>
  )
}

function ScrambleText({ text, duration = 4.2, className }: { text: string, duration?: number, className?: string }) {

  useEffect(() => {
    const heading = document.querySelector('h1') as HTMLHeadingElement
    if (!heading) return
    scrambleText(heading as HTMLHeadingElement, text, duration)
  }, [text, duration])

  return (


    <h1 className={`text-secondary font-bold text-5xl w-full ${className}`}>
      {text}
    </h1>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      <NavBar />
      <div className="w-full h-full">
        <div className="flex flex-col items-center justify-center h-svh relative">
          <div className="border-r border-primary left-0 absolute h-full w-4"></div>
          <div className="border-l border-primary right-0 absolute h-full w-4"></div>
          <div className="flex items-center bg-primary gap-2 border-l w-4 h-10 absolute top-0 right-0" />
          <section className="w-full h-full flex flex-col items-center justify-center px-4 pt-10">
            <div className="w-full flex h-full  px-4 pt-4 flex-row gap-4 ">
              <div className="max-w-[480px] min-w-[480px] w-full bg-primary p-10 h-full relative overflow-hidden">
                <ScrambleText className="w-full z-20 absolute top-10 left-10" text="PROJECT/MONOLiTH." duration={1} />
                <div className="pt-12 z-30 absolute top-20 left-10">
                  <ScrambleHeadings duration={2} />
                </div>
                <div className="absolute -bottom-100 left-0 w-full h-full gap-0 z-0  grid grid-cols-40">
                  <div className="col-span-34 flex overflow-hidden relative mask-luminance mask-t-from-white mask-t-from-20% mask-t-to-black">
                  </div>
                  <div className="col-span-1 pt-60 flex overflow-hidden relative mask-luminance mask-t-from-white mask-t-from-50% mask-t-to-black">
                    <CanvasRevealEffectDemo3 animationSpeed={0.1} />
                  </div>
                  <div className="col-span-2 flex overflow-hidden relative mask-luminance mask-t-from-white mask-t-from-20% mask-t-to-black">
                  </div>
                  <div className="col-span-1 flex overflow-hidden relative mask-luminance mask-t-from-white mask-t-from-20% mask-t-to-black">
                    <CanvasRevealEffectDemo3 animationSpeed={0.1} />
                  </div>
                </div>

              </div>
              <div className="flex flex-col w-full gap-y-4">
                <div className="flex text-[32px] ">
                  <div className="flex bg-primary">
                    <div className="text-secondary font-bold ">DESIGN.</div>
                    <div className="text-secondary font-bold ">DEVELOP.</div>
                    <div className="text-secondary font-bold ">DEPLOY.</div></div>
                </div>
                <h1 className="text-primary font-thin text-5xl w-full">FREE INTERFACES → COPY JSX → PASTE AND MODIFY ∞</h1>
                <div className="flex flex-row justify-between w-full">
                  <div className="flex justify-between w-full items-center gap-x-4 pt-0">
                    <div className="flex gap-x-4">
                      <button className="hover:bg-primary hover:text-secondary transition-all duration-300 hover:cursor-pointer text-primary text-3xl px-4 py-2 border">{"GET IN TOUCH →"}
                      </button>
                      <button className="hover:bg-primary hover:text-secondary transition-all duration-300 hover:cursor-pointer text-primary text-3xl px-4 py-2 border">{"VODING.DEV"}
                      </button>
                    </div>
                    <AnalogClock size={150} /></div>
                </div>

                <div className="h-[44px] border-b text-xl -mx-8 px-8 flex justify-start items-end">0101201020101203102310512132010120101012</div>
              </div>

            </div>

          </section>
        </div>
      </div>
    </main>
  );
}
