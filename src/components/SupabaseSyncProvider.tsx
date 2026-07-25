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
          // Fetch ALL users from public.users to overwrite dummy data
          const { data: allUsers, error: allUsersError } = await supabase
            .from("users")
            .select("*");

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

              const currentUser = mappedUsers.find(u => u.id === session.user.id) || null;

              return {
                currentUser: currentUser,
                users: mappedUsers,
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
