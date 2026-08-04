"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useStore, User } from "@/store/useStore";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  MessageCircle, 
  Send, 
  UserCheck, 
  Sparkles,
  Users,
  Trash2,
  ChevronLeft
} from "lucide-react";
import FriendBadge, { isMutualFriend } from "@/components/FriendBadge";

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialUserIdParam = searchParams.get("user");

  const users = useStore(state => state.users);
  const currentUser = useStore(state => state.currentUser);
  const directMessages = useStore(state => state.directMessages || []);
  const sendDirectMessage = useStore(state => state.sendDirectMessage);
  const deleteDirectMessage = useStore(state => state.deleteDirectMessage);
  const markMessagesAsRead = useStore(state => state.markMessagesAsRead);
  const setActiveChatUserId = useStore(state => state.setActiveChatUserId);

  // We do NOT auto-select on mobile so the user sees the list first.
  // On desktop, they see the empty state until they select a friend.
  const [selectedFriendId, setSelectedFriendId] = useState<number | string | null>(
    initialUserIdParam ? initialUserIdParam : null
  );
  
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync activeChatUserId to store for NotificationBanner
  useEffect(() => {
    setActiveChatUserId(selectedFriendId);
    return () => setActiveChatUserId(null); // Cleanup on unmount
  }, [selectedFriendId, setActiveChatUserId]);

  // A mutual friend is a user where currentUser follows them AND they follow currentUser
  const mutualFriends = users.filter(u => {
    if (!currentUser || u.id === currentUser.id) return false;
    return (
      currentUser.following?.includes(u.id) &&
      currentUser.followers?.includes(u.id)
    );
  });

  // Mark messages as read when a chat is opened
  useEffect(() => {
    if (selectedFriendId && currentUser) {
      markMessagesAsRead(selectedFriendId);
    }
  }, [selectedFriendId, currentUser, markMessagesAsRead]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [directMessages, selectedFriendId]);

  const selectedFriend = users.find(u => String(u.id) === String(selectedFriendId));

  const currentChatMessages = directMessages
    .filter(
      msg =>
        (String(msg.senderId) === String(currentUser?.id) && String(msg.receiverId) === String(selectedFriendId)) ||
        (String(msg.senderId) === String(selectedFriendId) && String(msg.receiverId) === String(currentUser?.id))
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFriendId || !messageText.trim()) return;
    if (!isMutualFriend(currentUser, selectedFriend)) return;
    sendDirectMessage(selectedFriendId, messageText);
    setMessageText("");
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Giriş Yapılmadı</h2>
        <p className="text-slate-500 mt-2">Arkadaşlarınızla mesajlaşmak için lütfen giriş yapın.</p>
        <Link href="/auth" className="inline-block mt-4 px-6 py-3 bg-pb-green text-pb-dark font-black rounded-2xl">
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-6 px-3 sm:px-8 flex flex-col gap-4 sm:gap-6 h-full min-h-[calc(100vh-100px)]">
      {/* Top Banner (Hidden on mobile when chat is open) */}
      <div className={`items-center justify-between bg-white dark:bg-slate-900/90 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-2 ${selectedFriendId ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-pb-green/10 text-pb-green flex items-center justify-center shrink-0 shadow-inner">
            <MessageCircle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Mesajlar (DM)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Sadece karşılıklı takipleştiğiniz arkadaşlar ile özel mesajlaşabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="bg-white dark:bg-[#1a2332] sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 sm:shadow-xl overflow-hidden flex flex-col md:flex-row flex-1 h-[75vh]">
        {/* Friends Sidebar */}
        <div className={`w-full md:w-80 md:border-r border-slate-200 dark:border-slate-800 flex-col bg-slate-50/50 dark:bg-[#1a2332] ${selectedFriendId ? 'hidden md:flex' : 'flex'} flex-1 md:flex-none`}>
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2332] flex items-center justify-between shrink-0">
            <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-pb-green" /> Arkadaş Listeniz ({mutualFriends.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {mutualFriends.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">Arkadaşınız yok</p>
                <p className="text-xs font-medium text-slate-400 mb-4">Mesajlaşmak için önce karşılıklı takipleşmelisiniz.</p>
                <Link href="/partners" className="px-5 py-2.5 bg-pb-green text-pb-dark text-xs font-extrabold rounded-xl shadow-sm hover:scale-105 transition-transform">
                  Partner Bul
                </Link>
              </div>
            ) : (
              mutualFriends.map(friend => {
                const unreadCount = directMessages.filter(
                  msg => String(msg.senderId) === String(friend.id) && String(msg.receiverId) === String(currentUser.id) && !msg.isRead
                ).length;

                return (
                  <button
                    key={friend.id}
                    onClick={() => setSelectedFriendId(friend.id)}
                    className={`w-full text-left p-4 flex items-center justify-between transition-all ${
                      String(selectedFriendId) === String(friend.id)
                        ? "bg-pb-green/15 dark:bg-pb-green/20 border-l-4 border-pb-green"
                        : "hover:bg-slate-50 dark:hover:bg-slate-700/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-base shrink-0 overflow-hidden relative">
                        {friend.avatarUrl ? (
                          <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                        ) : (
                          friend.name.charAt(0)
                        )}
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-slate-800"></span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {friend.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-semibold truncate mt-0.5">
                          {friend.city || "Türkiye"} • {friend.singlesRating.toFixed(2)} Rating
                        </div>
                      </div>
                    </div>

                    {unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-pb-green text-pb-dark font-black text-xs flex items-center justify-center shrink-0">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex-col bg-slate-50/30 dark:bg-slate-900/30 relative ${selectedFriendId ? 'flex' : 'hidden md:flex'}`}>
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedFriendId(null)}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold overflow-hidden">
                    {selectedFriend.avatarUrl ? (
                      <img src={selectedFriend.avatarUrl} alt={selectedFriend.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedFriend.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/profile/${selectedFriend.id}`}
                      className="font-extrabold text-sm text-slate-900 dark:text-white hover:text-pb-green"
                    >
                      {selectedFriend.name}
                    </Link>
                    <div className="mt-0.5">
                      {isMutualFriend(currentUser, selectedFriend) ? (
                        <FriendBadge currentUser={currentUser} targetUser={selectedFriend} />
                      ) : (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          Karşılıklı Takip Edilmiyor
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-3">
                {currentChatMessages.length === 0 ? (
                  <div className="m-auto text-center p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-sm shadow-sm">
                    <Sparkles className="w-8 h-8 text-pb-green mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {selectedFriend.name} ile konuşmaya başla 🎾
                    </p>
                  </div>
                ) : (
                  currentChatMessages.map(msg => {
                    const isMine = String(msg.senderId) === String(currentUser.id);
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${
                          isMine ? "self-end items-end" : "self-start items-start"
                        }`}
                      >
                        <div
                          className={`px-4 py-3 rounded-2xl text-[13px] sm:text-sm font-medium relative group shadow-sm ${
                            isMine
                              ? "bg-pb-green text-pb-dark rounded-br-none font-bold pr-10"
                              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {msg.content}
                          {isMine && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Bu mesajı silmek istediğinize emin misiniz?")) {
                                  deleteDirectMessage(msg.id);
                                }
                              }}
                              className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-pb-dark/40 hover:text-red-600 hover:bg-red-500/10 rounded-full transition-all"
                              title="Mesajı Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1 font-semibold">
                          {new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form or Non-Friend Warning */}
              {isMutualFriend(currentUser, selectedFriend) ? (
                <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 flex items-center gap-2 sm:gap-3 shrink-0">
                  <input
                    type="text"
                    placeholder="Mesaj yaz..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-4 py-3.5 bg-slate-100 dark:bg-slate-900 border border-transparent rounded-2xl text-[13px] sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-pb-green focus:bg-white dark:focus:bg-slate-800 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="w-12 h-12 sm:w-auto sm:h-auto sm:px-5 sm:py-3.5 bg-gradient-to-r from-pb-green to-lime-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:grayscale hover:scale-105 active:scale-95 shadow-md hover:shadow-pb-green/30 transition-all shrink-0"
                  >
                    <span className="hidden sm:inline">Gönder</span>
                    <Send className="w-5 h-5 sm:w-4 sm:h-4 ml-0.5 sm:ml-0" />
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <UserCheck className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs sm:text-sm font-bold">
                      Mesajlaşabilmek için karşılıklı takipleşmeniz gerekir.
                    </span>
                  </div>
                  <Link
                    href={`/profile/${selectedFriend.id}`}
                    className="px-4 py-2 bg-amber-500 text-white font-extrabold text-xs rounded-xl hover:bg-amber-600 transition-colors shrink-0 shadow-sm"
                  >
                    Profili Gör
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/40">
              <div className="w-24 h-24 mb-4 rounded-full bg-slate-200/50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                <MessageCircle className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300 mb-2">Mesajlaşmaya Başlayın</h3>
              <p className="font-medium text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Soldaki listeden bir arkadaşınızı seçerek anında sohbet başlatabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-bold text-slate-500">Mesajlar yükleniyor...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
