'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CornerDownRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | number;
}

export default function CommentDrawer({ isOpen, onClose, postId }: CommentDrawerProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string, username: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const currentUser = useStore((state: any) => state.currentUser);
  const allUsers = useStore((state: any) => state.users);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setReplyingTo(null);
      setNewComment('');
      return;
    }

    let isMounted = true;
    
    // Fetch comments
    const fetchComments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId.toString())
        .order('created_at', { ascending: true });
        
      if (!error && data && isMounted) {
        setComments(data);
      }
      if (isMounted) setLoading(false);
    };

    fetchComments();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`comments_post_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId.toString()}`
        },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            setComments((prev: any[]) => [...prev, payload.new]);
          } else if (payload.eventType === 'DELETE') {
            setComments((prev: any[]) => prev.filter(c => c.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setComments((prev: any[]) => prev.map(c => c.id === payload.new.id ? payload.new : c));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [isOpen, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    const content = newComment.trim();
    const parentId = replyingTo ? replyingTo.id : null;
    setNewComment('');
    setReplyingTo(null);

    // Insert comment
    const { data: insertedComment, error } = await supabase.from('comments').insert({
      post_id: postId.toString(),
      author_id: currentUser.id.toString(),
      content,
      parent_id: parentId
    }).select().single();

    if (error) {
      console.error("Error inserting comment:", error);
      return;
    }

    // Process Mentions
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const matches = Array.from(content.matchAll(mentionRegex));
    const mentionedUsernames = Array.from(new Set(matches.map(m => m[1].toLowerCase())));

    // Identify mentioned users
    const mentionedUsers = allUsers.filter((u: any) => 
      u.username && mentionedUsernames.includes(u.username.toLowerCase()) && u.id !== currentUser.id
    );

    // Also notify post owner if it's a top level comment, or parent comment owner if it's a reply
    let ownerToNotify: string | null = null;
    if (parentId) {
      const parentComment = comments.find(c => c.id === parentId);
      if (parentComment && parentComment.author_id !== currentUser.id.toString()) {
        ownerToNotify = parentComment.author_id;
      }
    } else {
      // Find post owner
      const posts = (useStore.getState() as any).posts;
      const post = posts.find((p: any) => p.id.toString() === postId.toString());
      if (post && post.authorId.toString() !== currentUser.id.toString()) {
        ownerToNotify = post.authorId.toString();
      }
    }

    // Prepare notifications
    const notificationsToInsert = [];
    const notifIdsToSkip = new Set<string>();

    for (const u of mentionedUsers) {
      notificationsToInsert.push({
        user_id: u.id.toString(),
        type: 'mention',
        message: `${currentUser.name} sizden bir yorumda bahsetti.`,
        related_match_id: postId.toString()
      });
      notifIdsToSkip.add(u.id.toString());
    }

    if (ownerToNotify && !notifIdsToSkip.has(ownerToNotify)) {
      notificationsToInsert.push({
        user_id: ownerToNotify,
        type: 'comment',
        message: parentId ? `${currentUser.name} yorumunuza yanıt verdi.` : `${currentUser.name} gönderinize yorum yaptı.`,
        related_match_id: postId.toString()
      });
    }

    if (notificationsToInsert.length > 0) {
      supabase.from('notifications').insert(notificationsToInsert).then();
    }
  };

  const handleReplyClick = (commentId: string, username: string) => {
    setReplyingTo({ id: commentId, username });
    if (inputRef.current) inputRef.current.focus();
  };

  // Render text with @mentions as links
  const renderContent = (text: string) => {
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const username = part.substring(1);
        const user = allUsers.find((u: any) => u.username?.toLowerCase() === username.toLowerCase());
        if (user) {
          return (
            <Link key={i} href={`/profile/${user.id}`} className="text-pb-green hover:underline">
              {part}
            </Link>
          );
        }
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Organize comments into parent/child tree
  const parentComments = comments.filter(c => !c.parent_id);
  const childComments = comments.filter(c => c.parent_id);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[60] h-[80vh] md:h-[100vh] md:w-[400px] md:right-0 md:left-auto bg-slate-900 md:border-l border-t border-slate-700/50 shadow-2xl flex flex-col md:rounded-l-2xl rounded-t-3xl md:rounded-tr-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Yorumlar <span className="bg-pb-green/20 text-pb-green text-xs px-2 py-0.5 rounded-full">{comments.length}</span>
              </h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="w-6 h-6 border-2 border-pb-green border-t-transparent rounded-full animate-spin" />
                </div>
              ) : parentComments.length === 0 ? (
                <div className="text-center text-slate-500 py-10 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p>Henüz yorum yapılmamış.<br/>İlk yorumu sen yap!</p>
                </div>
              ) : (
                parentComments.map(comment => {
                  const author = allUsers.find((u: any) => u.id.toString() === comment.author_id) || { name: 'Bilinmeyen Kullanıcı', avatarUrl: '', username: '' };
                  const replies = childComments.filter(c => c.parent_id === comment.id);

                  return (
                    <motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-2"
                    >
                      <div className="flex gap-3">
                        <Link href={`/profile/${author.id}`}>
                          <img 
                            src={author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=random`} 
                            alt={author.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <Link href={`/profile/${author.id}`} className="font-semibold text-sm text-slate-200 hover:text-white truncate">
                              {author.name}
                            </Link>
                            <span className="text-xs text-slate-500 shrink-0">
                              {new Date(comment.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <div className="text-sm text-slate-300 mt-0.5 break-words">
                            {renderContent(comment.content)}
                          </div>
                          <button 
                            onClick={() => handleReplyClick(comment.id, author.username || author.name)}
                            className="text-xs text-slate-500 hover:text-slate-300 mt-1 font-medium transition-colors"
                          >
                            Yanıtla
                          </button>
                        </div>
                      </div>

                      {/* Replies */}
                      {replies.length > 0 && (
                        <div className="ml-11 flex flex-col gap-3 mt-1">
                          {replies.map(reply => {
                            const repAuthor = allUsers.find((u: any) => u.id.toString() === reply.author_id) || { name: 'Bilinmeyen Kullanıcı', avatarUrl: '', username: '' };
                            return (
                              <div key={reply.id} className="flex gap-3">
                                <Link href={`/profile/${repAuthor.id}`}>
                                  <img 
                                    src={repAuthor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(repAuthor.name)}&background=random`} 
                                    alt={repAuthor.name}
                                    className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
                                  />
                                </Link>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline gap-2">
                                    <Link href={`/profile/${repAuthor.id}`} className="font-semibold text-xs text-slate-200 hover:text-white truncate">
                                      {repAuthor.name}
                                    </Link>
                                    <span className="text-[10px] text-slate-500 shrink-0">
                                      {new Date(reply.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-300 mt-0.5 break-words">
                                    {renderContent(reply.content)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 mb-safe">
              {replyingTo && (
                <div className="flex items-center justify-between text-xs text-pb-green bg-pb-green/10 px-3 py-1.5 rounded-t-lg border border-pb-green/20 border-b-0">
                  <span className="flex items-center gap-1"><CornerDownRight className="w-3 h-3"/> @{replyingTo.username}'e yanıt veriliyor</span>
                  <button onClick={() => setReplyingTo(null)} className="hover:text-white"><X className="w-3 h-3"/></button>
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Yorum yaz... (@kullaniciadi ile etiketle)"
                  className={`flex-1 bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-pb-green transition-all outline-none ${replyingTo ? 'rounded-tl-none' : ''}`}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-pb-green text-slate-900 p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-all shrink-0 flex items-center justify-center shadow-lg shadow-pb-green/20"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
