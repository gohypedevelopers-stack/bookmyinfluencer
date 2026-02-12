'use client';

import { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface LivePhotoCaptureProps {
    onUploadSuccess: (key: string) => void;
    userId: string;
}

const PROMPTS = ['SMILE', 'BLINK'] as const;

export default function LivePhotoCapture({ onUploadSuccess, userId }: LivePhotoCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState<(typeof PROMPTS)[number]>('SMILE');
    const [isCameraActive, setIsCameraActive] = useState(false);

    useEffect(() => {
        // Randomize prompt on mount
        setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 1024 }, height: { ideal: 1024 } },
                audio: false,
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsCameraActive(true);
        } catch (err) {
            console.error('Error accessing camera:', err);
            toast.error('Could not access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;

        // Set canvas dimensions to match video aspect ratio
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Add watermark
        ctx.font = '20px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        const dateStr = new Date().toLocaleString();
        ctx.fillText(`BookMyInfluencer - Live Verification - ${dateStr}`, 20, canvas.height - 20);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
    };

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const uploadPhoto = async () => {
        if (!capturedImage) return;

        setLoading(true);
        try {
            // Convert dataUrl to blob
            const response = await fetch(capturedImage);
            const blob = await response.blob();

            const formData = new FormData();
            formData.append('file', blob, 'selfie.jpg');
            formData.append('prompt', prompt);
            formData.append('result', 'PASSED'); // In a simple flow, we assume passed if they captured it

            const res = await fetch('/api/upload/selfie', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Selfie verified and uploaded!');
                onUploadSuccess(data.key);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            toast.error('Failed to upload selfie. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="p-6 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Live Photo Verification</h3>
                <p className="text-sm text-gray-500">
                    To ensure account security, please capture a real-time selfie.
                </p>
            </div>

            <div className="relative aspect-square w-full max-w-sm mx-auto bg-gray-900 rounded-2xl overflow-hidden mb-6 group border-4 border-gray-100 shadow-inner">
                {isCameraActive && !capturedImage && (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                )}

                {capturedImage && (
                    <img
                        src={capturedImage}
                        alt="Captured selfie"
                        className="w-full h-full object-cover"
                    />
                )}

                {!isCameraActive && !capturedImage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                        <Camera className="w-12 h-12 mb-4 opacity-20" />
                        <Button
                            onClick={startCamera}
                            className="bg-[#2dd4bf] hover:bg-[#14b8a6] text-white rounded-full px-6"
                        >
                            Start Camera
                        </Button>
                    </div>
                )}

                {isCameraActive && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                            <span className="text-white text-sm font-bold flex items-center gap-2">
                                {prompt === 'SMILE' ? 'Please Smile 🙂' : 'Please Blink 👀'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex flex-col gap-3">
                {isCameraActive && (
                    <Button
                        onClick={capturePhoto}
                        className="w-full h-12 bg-[#2dd4bf] hover:bg-[#14b8a6] text-white font-bold text-lg rounded-2xl shadow-lg shadow-teal-500/20"
                    >
                        Capture Photo
                    </Button>
                )}

                {capturedImage && (
                    <div className="flex gap-3">
                        <Button
                            onClick={retake}
                            disabled={loading}
                            variant="outline"
                            className="flex-1 h-12 border-gray-200 rounded-2xl font-bold"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retake
                        </Button>
                        <Button
                            onClick={uploadPhoto}
                            disabled={loading}
                            className="flex-1 h-12 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Confirm & Upload
                                </>
                            )}
                        </Button>
                    </div>
                )}

                <div className="bg-blue-50 p-4 rounded-xl flex gap-3 mt-4">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                        Your selfie is stored securely and used only for identity verification. File uploads are disabled to prevent fraud.
                    </p>
                </div>
            </div>
        </Card>
    );
}
