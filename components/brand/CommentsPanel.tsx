"use client"

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, CornerDownRight, Heart } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface Comment {
    id: string;
    author: string;
    avatar: string;
    text: string;
    time: string;
    likes: number;
    replies?: Comment[];
}

interface CommentsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const INITIAL_COMMENTS: Comment[] = [
    {
        id: '1',
        author: 'System Support',
        avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop',
        text: 'Welcome to the InfluencerHub! Let us know if you need help finding the right creators for your brand campaign.',
        time: '2h ago',
        likes: 5,
        replies: [
            {
                id: '1-1',
                author: 'Marketing Team',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
                text: 'We are looking for Tech influencers in Mumbai.',
                time: '1h ago',
                likes: 2,
            }
        ]
    },
    {
        id: '2',
        author: 'Campaign Manager',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
        text: 'The new analytics dashboard is looking great!',
        time: '45m ago',
        likes: 12,
    }
];

export function CommentsPanel({ isOpen, onClose }: CommentsPanelProps) {
    const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments]);

    const handleSend = () => {
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now().toString(),
            author: 'You',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
            text: newComment,
            time: 'Just now',
            likes: 0,
        };

        if (replyingTo) {
            setComments(comments.map(c => {
                if (c.id === replyingTo) {
                    return { ...c, replies: [...(c.replies || []), comment] };
                }
                return c;
            }));
            setReplyingTo(null);
        } else {
            setComments([...comments, comment]);
        }
        setNewComment('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
                    >
                        {/* Header */}
                        <div className="flex-none p-5 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Team Comments</h2>
                                <p className="text-xs text-slate-500 font-medium">Real-time collaboration</p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent bg-slate-50/50">
                            {comments.map((comment) => (
                                <div key={comment.id} className="space-y-4">
                                    <div className="flex gap-3 group">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0 ring-2 ring-white shadow-sm">
                                            <Image src={comment.avatar} alt={comment.author} width={32} height={32} className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm relative group-hover:border-indigo-100 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-sm text-slate-900">{comment.author}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">{comment.time}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed">{comment.text}</p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1.5 ml-2 text-xs font-bold text-slate-400">
                                                <button className="hover:text-pink-500 transition-colors flex items-center gap-1">
                                                    <Heart className="w-3.5 h-3.5" /> {comment.likes}
                                                </button>
                                                <button 
                                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                    className={`hover:text-indigo-600 transition-colors ${replyingTo === comment.id ? 'text-indigo-600' : ''}`}
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="pl-10 space-y-4">
                                            {comment.replies.map(reply => (
                                                <div key={reply.id} className="flex gap-3 group">
                                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 shrink-0 ring-2 ring-white shadow-sm mt-1">
                                                        <Image src={reply.avatar} alt={reply.author} width={24} height={24} className="object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="bg-slate-100/80 p-3 rounded-2xl rounded-tl-sm border border-slate-100/50 shadow-sm relative group-hover:border-indigo-100 transition-colors">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-bold text-xs text-slate-900">{reply.author}</span>
                                                                <span className="text-[10px] font-bold text-slate-400">{reply.time}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 leading-relaxed">{reply.text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="flex-none p-4 bg-white border-t border-slate-200">
                            {replyingTo && (
                                <div className="flex items-center justify-between bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <CornerDownRight className="w-3.5 h-3.5" />
                                        Replying to {comments.find(c => c.id === replyingTo)?.author}
                                    </div>
                                    <button onClick={() => setReplyingTo(null)} className="hover:text-indigo-900">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                            <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100/50 transition-all">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Write a comment..."
                                    className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] text-sm text-slate-700 py-2.5 px-3 scrollbar-thin"
                                    rows={1}
                                />
                                <Button 
                                    onClick={handleSend}
                                    disabled={!newComment.trim()}
                                    size="icon"
                                    className="w-10 h-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
