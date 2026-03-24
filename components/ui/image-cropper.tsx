"use client"

import React, { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { X, ZoomIn, ZoomOut, RotateCcw, Check } from "lucide-react"

interface Area {
    x: number
    y: number
    width: number
    height: number
}

interface ImageCropperProps {
    imageSrc: string
    aspectRatio: number
    onCropComplete: (croppedFile: File, previewUrl: string) => void
    onCancel: () => void
    title?: string
}

/** Helper: extract a cropped image from a source using a canvas. */
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: Area,
    outputFileName: string = "cropped.jpg"
): Promise<{ file: File; previewUrl: string }> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image()
        img.addEventListener("load", () => resolve(img))
        img.addEventListener("error", (error) => reject(error))
        img.setAttribute("crossOrigin", "anonymous")
        img.src = imageSrc
    })

    const canvas = document.createElement("canvas")
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext("2d")

    if (!ctx) throw new Error("Could not get canvas context")

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Canvas is empty"))
                return
            }
            const file = new File([blob], outputFileName, { type: "image/jpeg" })
            const previewUrl = URL.createObjectURL(blob)
            resolve({ file, previewUrl })
        }, "image/jpeg", 0.9)
    })
}

export function ImageCropper({
    imageSrc,
    aspectRatio,
    onCropComplete,
    onCancel,
    title = "Crop Image",
}: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleCropChange = useCallback((location: { x: number; y: number }) => {
        setCrop(location)
    }, [])

    const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels)
    }, [])

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return
        setIsProcessing(true)
        try {
            const outputName = aspectRatio === 1 ? "profile.jpg" : "cover.jpg"
            const { file, previewUrl } = await getCroppedImg(imageSrc, croppedAreaPixels, outputName)
            onCropComplete(file, previewUrl)
        } catch (err) {
            console.error("Crop failed:", err)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onCancel}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Crop Area */}
                <div className="relative bg-gray-900" style={{ height: 380 }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspectRatio}
                        onCropChange={handleCropChange}
                        onCropComplete={handleCropComplete}
                        onZoomChange={setZoom}
                        cropShape={aspectRatio === 1 ? "round" : "rect"}
                        showGrid={true}
                    />
                </div>

                {/* Zoom Controls */}
                <div className="px-6 py-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-2 appearance-none bg-gray-200 rounded-full cursor-pointer accent-purple-600"
                        />
                        <button
                            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => { setZoom(1); setCrop({ x: 0, y: 0 }) }}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Reset"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-6 pb-5">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg shadow-purple-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {isProcessing ? (
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    )
}
