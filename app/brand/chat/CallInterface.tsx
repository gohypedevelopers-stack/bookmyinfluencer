'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, User } from 'lucide-react';
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

interface CallInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    currentUserName: string;
    currentUserImage: string | null;
    recipientId: string;
    recipientName: string;
    recipientImage: string | null;
    initialIsVideo: boolean;
    socket: Socket | null;
}

export default function CallInterface({
    isOpen,
    onClose,
    currentUserId,
    currentUserName,
    currentUserImage,
    recipientId,
    recipientName,
    recipientImage,
    initialIsVideo,
    socket
}: CallInterfaceProps) {
    const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected' | 'ended'>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(initialIsVideo);

    // Media Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

    // Initialize Call if open is true and status is idle (caller side) or ringing (receiver side handled by parent?)
    // Actually, parent should handle 'ringing' state triggering this modal.
    // Let's assume if isOpen is true and status is 'idle', we are the caller.

    useEffect(() => {
        if (!isOpen) {
            cleanupCall();
            return;
        }

        // Initialize Media
        startLocalStream().then((stream) => {
            if (stream) {
                // Check if we are the initiator (caller)
                // For simplicity, let's assume we are caller if status is 'idle'
                if (callStatus === 'idle') {
                    startCall(stream);
                }
            }
        });

    }, [isOpen]);

    // Handle Socket Events for Call
    useEffect(() => {
        if (!socket) return;

        socket.on("call-accepted", (signal) => {
            setCallStatus('connected');
            // Handle WebRTC answer signal...
            // Simplified: just show connected state for now
            toast.success("Call Connected!");
        });

        socket.on("call-rejected", () => {
            setCallStatus('ended');
            toast.error("Call Rejected");
            setTimeout(onClose, 2000);
        });

        socket.on("call-ended", () => {
            setCallStatus('ended');
            toast.info("Call Ended");
            setTimeout(onClose, 2000);
        });

        return () => {
            socket.off("call-accepted");
            socket.off("call-rejected");
            socket.off("call-ended");
        }
    }, [socket]);


    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: initialIsVideo,
                audio: true
            });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            console.error("Error accessing media devices:", err);
            toast.error("Could not access camera/microphone");
            onClose();
            return null;
        }
    };

    const startCall = (stream: MediaStream) => {
        setCallStatus('calling');
        // Emit call-user event
        // In a real WebRTC app, we'd create an offer here using RTCPeerConnection
        // For the "Workable" demo, we'll simulate the signaling flow
        socket?.emit("call-user", {
            userToCall: recipientId,
            signalData: { type: 'offer', sdp: 'dummy-sdp' }, // Placeholder for actual WebRTC signal
            from: currentUserId,
            name: currentUserName
        });
    };

    const cleanupCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        setCallStatus('idle');
    };

    const handleEndCall = () => {
        socket?.emit("end-call", { to: recipientId });
        setCallStatus('ended');
        setTimeout(onClose, 1000);
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !isMuted;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !isVideoEnabled;
            });
            setIsVideoEnabled(!isVideoEnabled);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl h-full md:h-[80vh] flex flex-col items-center justify-center p-4">

                {/* Remote Video / Avatar Area */}
                <div className="relative w-full flex-1 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center mb-6">
                    {callStatus === 'connected' ? (
                        <div className="text-white">Remote Video Placeholder (WebRTC P2P)</div>
                        // <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center animate-pulse">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-500 shadow-lg shadow-teal-500/50 mb-6">
                                {recipientImage ? (
                                    <img src={recipientImage} alt={recipientName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                        <User className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">{recipientName}</h3>
                            <p className="text-teal-400 font-medium">
                                {callStatus === 'calling' ? 'Calling...' :
                                    callStatus === 'ringing' ? 'Ringing...' :
                                        callStatus === 'ended' ? 'Call Ended' : 'Connecting...'}
                            </p>
                        </div>
                    )}

                    {/* Local Video Overlay */}
                    <div className="absolute top-4 right-4 w-32 h-48 bg-black rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 pb-8">
                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={toggleMute}
                        className={`w-14 h-14 rounded-full shadow-lg ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white border-none' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </Button>

                    <Button
                        size="icon"
                        variant="destructive"
                        onClick={handleEndCall}
                        className="w-16 h-16 rounded-full shadow-lg shadow-red-500/30 hover:scale-105 transition-transform"
                    >
                        <PhoneOff className="w-8 h-8" />
                    </Button>

                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={toggleVideo}
                        className={`w-14 h-14 rounded-full shadow-lg ${!isVideoEnabled ? 'bg-red-500 hover:bg-red-600 text-white border-none' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                    >
                        {!isVideoEnabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                    </Button>
                </div>

            </div>
        </div>
    );
}
