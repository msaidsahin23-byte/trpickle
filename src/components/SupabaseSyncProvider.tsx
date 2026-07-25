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
          // Fetch user profile from public.users
          const { data: userData, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (userData) {
            useStore.setState((state) => {
              // Only add if not exists, or update
              const existingUser = state.users.find(u => u.id === userData.id);
              const mappedUser = {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                username: userData.username || userData.email.split("@")[0],
                firstName: userData.name?.split(" ")[0] || "",
                lastName: userData.name?.split(" ").slice(1).join(" ") || "",
                singlesRating: userData.singles_rating || 2.5,
                doublesRating: userData.doubles_rating || 2.5,
                tags: userData.tags || [],
                // Ensure role is hidden from ordinary users! But for now we just don't expose an admin role explicitly unless it's a specific user
                role: userData.role || "user", 
                city: userData.city || "İstanbul",
                gender: userData.gender || "male",
                birthdate: userData.birthdate || "1995-01-01",
                followers: userData.followers || [],
                following: userData.following || [],
                bio: userData.bio || "",
                avatarUrl: userData.avatar_url,
                bannerUrl: userData.banner_url,
              };

              const newUsers = existingUser 
                ? state.users.map(u => u.id === userData.id ? mappedUser : u)
                : [...state.users, mappedUser];

              return {
                currentUser: mappedUser,
                users: newUsers,
                activeSessions: [mappedUser] // simplified for now
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
