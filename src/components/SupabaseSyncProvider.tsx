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
          const [ { data: allUsers }, { data: allPosts }, { data: allMessages }, { data: allNotifications } ] = await Promise.all([
            supabase.from("users").select("*"),
            supabase.from("posts").select("*, comments(count)").order("time", { ascending: false }),
            supabase.from("messages").select("*").order("created_at", { ascending: true }),
            supabase.from("notifications").select("*").order("created_at", { ascending: false })
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
                level: userData.level || 1,
                xp: userData.xp || 0,
                paddle: userData.paddle || "",
                favoriteCourt: userData.favorite_court || "",
                accentColor: userData.accent_color || "#cfff50",
                appTheme: userData.app_theme || "light",
                notificationsEnabled: userData.notifications_enabled ?? true,
                showPostsOnProfile: userData.show_posts_on_profile ?? true
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
                  level: 1,
                  xp: 0,
                  paddle: "",
                  favoriteCourt: "",
                  accentColor: "#cfff50",
                  appTheme: "light",
                  notificationsEnabled: true,
                  showPostsOnProfile: true
                } as any;
                
                // Insert async in background to avoid blocking
                supabase.from("users").insert({
                  id: currentUser!.id,
                  email: currentUser!.email,
                  name: currentUser!.name,
                  username: currentUser!.username,
                  city: currentUser!.city,
                  gender: currentUser!.gender,
                  birthdate: currentUser!.birthdate,
                  singles_rating: currentUser!.singlesRating,
                  doubles_rating: currentUser!.doublesRating,
                  role: currentUser!.role
                }).then(({error}) => {
                  if (error) console.error("Auto-heal insert error:", error);
                });
                
                mappedUsers.push(currentUser as any);
              }

              const mappedPosts: any[] = (allPosts || []).map(p => ({
                id: p.id,
                authorId: p.author_id,
                author: p.author_name,
                rating: p.rating,
                content: p.content,
                time: p.time,
                likedBy: p.liked_by || [],
                comments: Array.from({ length: (p.comments?.[0]?.count || p.comments?.length || 0) }) as any[],
                imageUrl: p.image_url,
                linkedMatchId: p.linked_match_id
              }));

              const mappedMessages: any[] = (allMessages || []).map(m => ({
                id: m.id,
                senderId: m.sender_id,
                receiverId: m.receiver_id,
                content: m.content,
                createdAt: m.created_at,
                isRead: m.is_read
              }));

              const mappedNotifications: any[] = (allNotifications || []).map(n => ({
                id: n.id,
                postId: n.related_match_id,
                matchId: n.match_id,
                type: n.type,
                message: n.message,
                isRead: n.read,
                createdAt: n.created_at,
                _userId: n.user_id // internal reference
              }));

              const finalUsers = mappedUsers.map(mu => {
                const existing = state.users.find(eu => eu.id === mu.id);
                
                const userNotifs = mappedNotifications.filter(n => n._userId === mu.id).map(n => {
                  const { _userId, ...rest } = n;
                  return rest;
                });

                return existing ? { 
                  ...existing, 
                  ...mu,
                  notifications: userNotifs.length > 0 ? userNotifs : existing.notifications,
                  level: existing.level || mu.level,
                  xp: existing.xp || mu.xp,
                  paddle: existing.paddle || mu.paddle,
                  favoriteCourt: existing.favoriteCourt || mu.favoriteCourt,
                  accentColor: existing.accentColor || mu.accentColor,
                  appTheme: existing.appTheme || mu.appTheme,
                  unlockedAchievements: existing.unlockedAchievements || []
                } : mu;
              });
              
              const finalCurrentUser = finalUsers.find(u => u.id === session.user.id) || currentUser;

              // MERGE POSTS & MESSAGES WITH LOCAL STATE TO AVOID LOSING LOCALLY CREATED ONES
              const finalPosts = [...mappedPosts];
              state.posts.forEach(lp => {
                if (!finalPosts.find(fp => fp.id.toString() === lp.id.toString())) {
                  finalPosts.push(lp);
                }
              });

              return {
                currentUser: finalCurrentUser,
                users: finalUsers,
                posts: finalPosts,
                directMessages: mappedMessages,
                activeSessions: finalCurrentUser ? [finalCurrentUser] : []
              };
            });
            
            // Set up Realtime Subscriptions
            supabase.removeAllChannels();
            const channel = supabase.channel('schema-db-changes-' + Date.now())
              .on(
                'postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'posts',
                },
                (payload) => {
                  const p = payload.new as any;
                  useStore.setState((state) => {
                    if (payload.eventType === 'DELETE') {
                      const oldP = payload.old as any;
                      return { posts: state.posts.filter(x => x.id.toString() !== oldP.id) };
                    }
                    if (payload.eventType === 'INSERT') {
                      if (state.posts.some(existing => existing.id.toString() === p.id)) return state;
                      const mappedNewPost = {
                        id: p.id,
                        authorId: p.author_id,
                        author: p.author_name,
                        rating: p.rating,
                        content: p.content,
                        time: p.time,
                        likedBy: p.liked_by || [],
                        comments: Array.from({ length: (p.comments?.[0]?.count || p.comments?.length || 0) }) as any[],
                        imageUrl: p.image_url,
                        linkedMatchId: p.linked_match_id
                      };
                      return { posts: [mappedNewPost, ...state.posts] };
                    }
                    if (payload.eventType === 'UPDATE') {
                      return {
                        posts: state.posts.map(x => {
                          if (x.id.toString() === p.id) {
                            return {
                              ...x,
                              likedBy: p.liked_by || [],
                              comments: p.comments || []
                            };
                          }
                          return x;
                        })
                      };
                    }
                    return state;
                  });
                }
              )
              .on(
                'postgres_changes',
                {
                  event: 'INSERT',
                  schema: 'public',
                  table: 'notifications',
                },
                (payload) => {
                  const n = payload.new as any;
                  useStore.setState((state) => {
                    const newUsers = state.users.map(u => {
                      if (u.id === n.user_id) {
                        const newNotif = {
                          id: n.id,
                          postId: n.related_match_id,
                          matchId: n.match_id,
                          type: n.type,
                          message: n.message,
                          isRead: n.read,
                          createdAt: n.created_at
                        };
                        return { ...u, notifications: [newNotif, ...(u.notifications || [])] };
                      }
                      return u;
                    });
                    const newCurrentUser = state.currentUser ? (newUsers.find(x => x.id === state.currentUser!.id) || state.currentUser) : state.currentUser;
                    return { users: newUsers, currentUser: newCurrentUser };
                  });
                }
              )
              .on(
                'postgres_changes',
                {
                  event: 'UPDATE',
                  schema: 'public',
                  table: 'users',
                },
                (payload) => {
                  const u = payload.new as any;
                  useStore.setState((state) => {
                    const newUsers = state.users.map(existing => {
                      if (existing.id === u.id) {
                         return {
                           ...existing,
                           followers: u.followers || existing.followers,
                           following: u.following || existing.following,
                           avatarUrl: u.avatar_url || existing.avatarUrl,
                           bannerUrl: u.banner_url || existing.bannerUrl,
                           bio: u.bio || existing.bio
                         };
                      }
                      return existing;
                    });
                    const newCurrentUser = state.currentUser ? (newUsers.find(x => x.id === state.currentUser!.id) || state.currentUser) : state.currentUser;
                    return { users: newUsers, currentUser: newCurrentUser };
                  });
                }
              )
              .subscribe();
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
