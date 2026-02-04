"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
    className?: string
    min?: number
    max?: number
    step?: number
    value?: number[]
    defaultValue?: number[]
    onValueChange?: (value: number[]) => void
    minStepsBetweenThumbs?: number
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    ({ className, min = 0, max = 100, step = 1, value, defaultValue, onValueChange, minStepsBetweenThumbs = 0 }, ref) => {
        const [localValue, setLocalValue] = React.useState<number[]>(value || defaultValue || [min])
        const trackRef = React.useRef<HTMLDivElement>(null)

        React.useEffect(() => {
            if (value) {
                setLocalValue(value)
            }
        }, [value])

        const handleTrackClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
            // Logic handled by pointers usually, but track click can jump to nearest
        }

        const updateValue = (clientX: number, index: number) => {
            if (!trackRef.current) return

            const { left, width } = trackRef.current.getBoundingClientRect()
            const percentage = Math.min(Math.max((clientX - left) / width, 0), 1)
            const newValue = Math.round((percentage * (max - min) + min) / step) * step

            const newValues = [...localValue]

            // Prevent crossover
            if (newValues.length === 2) {
                if (index === 0) {
                    newValues[0] = Math.min(newValue, newValues[1] - (minStepsBetweenThumbs * step))
                } else {
                    newValues[1] = Math.max(newValue, newValues[0] + (minStepsBetweenThumbs * step))
                }
            } else {
                newValues[index] = newValue
            }

            setLocalValue(newValues)
            onValueChange?.(newValues)
        }

        const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
            e.preventDefault()
            const moveHandler = (moveEvent: MouseEvent) => updateValue(moveEvent.clientX, index)
            const upHandler = () => {
                document.removeEventListener("mousemove", moveHandler)
                document.removeEventListener("mouseup", upHandler)
            }
            document.addEventListener("mousemove", moveHandler)
            document.addEventListener("mouseup", upHandler)
        }

        const handleTouchStart = (index: number) => (e: React.TouchEvent) => {
            // e.preventDefault() // Passive listener issue potential
            const moveHandler = (moveEvent: TouchEvent) => updateValue(moveEvent.touches[0].clientX, index)
            const upHandler = () => {
                document.removeEventListener("touchmove", moveHandler)
                document.removeEventListener("touchend", upHandler)
            }
            document.addEventListener("touchmove", moveHandler)
            document.addEventListener("touchend", upHandler)
        }

        const getPercent = (val: number) => ((val - min) / (max - min)) * 100

        return (
            <div
                ref={ref}
                className={cn("relative flex w-full touch-none select-none items-center py-4 cursor-pointer", className)} // Added py-4 for hit area
            >
                <div
                    ref={trackRef}
                    className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200"
                >
                    <div
                        className="absolute h-full bg-teal-600"
                        style={{
                            left: `${localValue.length > 1 ? getPercent(localValue[0]) : 0}%`,
                            right: `${100 - getPercent(localValue[localValue.length - 1])}%`
                        }}
                    />
                </div>

                {localValue.map((val, index) => (
                    <div
                        key={index}
                        role="slider"
                        tabIndex={0}
                        aria-valuemin={min}
                        aria-valuemax={max}
                        aria-valuenow={val}
                        className="absolute block h-5 w-5 rounded-full border-2 border-teal-600 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 shadow-sm"
                        style={{ left: `calc(${getPercent(val)}% - 10px)` }} // -10px is half thumb width
                        onMouseDown={handleMouseDown(index)}
                        onTouchStart={handleTouchStart(index)}
                    />
                ))}
            </div>
        )
    }
)
Slider.displayName = "Slider"

export { Slider }
