"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

export default function SupabaseSyncProvider() {
  useEffect(() => {
    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch ALL users, posts, and messages from Supabase
          const [ { data: allUsers }, { data: allPosts }, { data: allMessages } ] = await Promise.all([
            supabase.from("users").select("*"),
            supabase.from("posts").select("*").order("time", { ascending: false }),
            supabase.from("messages").select("*").order("created_at", { ascending: true })
          ]);

          if (allUsers) {
            useStore.setState((state) => {
              const mappedUsers = allUsers.map(userData => ({
                id: userData.id,
                email: userData.email,
                name: userData.name,
                username: userData.username || userData.email.split("@")[0],
                firstName: userData.name?.split(" ")[0] || "",
                lastName: userData.name?.split(" ").slice(1).join(" ") || "",
                singlesRating: userData.singles_rating || 2.5,
                doublesRating: userData.doubles_rating || 2.5,
                tags: userData.tags || [],
                role: userData.role || "user", 
                city: userData.city || "İstanbul",
                gender: userData.gender || "male",
                birthdate: userData.birthdate || "1995-01-01",
                followers: userData.followers || [],
                following: userData.following || [],
                bio: userData.bio || "",
                avatarUrl: userData.avatar_url,
                bannerUrl: userData.banner_url,
              }));

              let currentUser = mappedUsers.find(u => u.id === session.user.id) || null;

              if (!currentUser) {
                // Auto-heal missing public.users record
                const newEmail = session.user.email || "";
                const meta = session.user.user_metadata || {};
                
                currentUser = {
                  id: session.user.id,
                  email: newEmail,
                  name: meta.name || newEmail.split("@")[0] || "Kullanıcı",
                  username: meta.username || newEmail.split("@")[0] || "user",
                  firstName: meta.firstName || "Yeni",
                  lastName: meta.lastName || "Kullanıcı",
                  singlesRating: 2.5,
                  doublesRating: 2.5,
                  tags: [],
                  role: "user",
                  city: meta.city || "İstanbul",
                  gender: meta.gender || "male",
                  birthdate: meta.birthdate || "2000-01-01",
                  followers: [],
                  following: [],
                  bio: "",
                  avatarUrl: "",
                  bannerUrl: "",
                };
                
                // Insert async in background to avoid blocking
                supabase.from("users").insert({
                  id: currentUser.id,
                  email: currentUser.email,
                  name: currentUser.name,
                  username: currentUser.username,
                  city: currentUser.city,
                  gender: currentUser.gender,
                  birthdate: currentUser.birthdate,
                  singles_rating: currentUser.singlesRating,
                  doubles_rating: currentUser.doublesRating,
                  role: currentUser.role
                }).then(({error}) => {
                  if (error) console.error("Auto-heal insert error:", error);
                });
                
                mappedUsers.push(currentUser);
              }

              const mappedPosts = (allPosts || []).map(p => ({
                id: p.id,
                authorId: p.author_id,
                author: p.author_name,
                rating: p.rating,
                content: p.content,
                time: p.time,
                likedBy: p.liked_by || [],
                comments: p.comments || [],
                imageUrl: p.image_url,
                linkedMatchId: p.linked_match_id
              }));

              const mappedMessages = (allMessages || []).map(m => ({
                id: m.id,
                senderId: m.sender_id,
                receiverId: m.receiver_id,
                content: m.content,
                createdAt: m.created_at,
                isRead: m.is_read
              }));

              return {
                currentUser: currentUser,
                users: mappedUsers,
                posts: mappedPosts,
                directMessages: mappedMessages,
                activeSessions: currentUser ? [currentUser] : []
              };
            });
          }
        } else {
          // Logged out
          useStore.setState({ currentUser: null, activeSessions: [] });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
