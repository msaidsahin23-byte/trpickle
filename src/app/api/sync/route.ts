import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: dbUsers, error: userError } = await supabase.from('users').select('*');
    const { data: dbMatches, error: matchError } = await supabase.from('matches').select('*');

    // Mappings from snake_case to camelCase
    const users = (dbUsers || []).map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      username: u.username || u.email?.split('@')[0] || "user",
      firstName: u.name?.split(" ")[0] || "",
      lastName: u.name?.split(" ").slice(1).join(" ") || "",
      singlesRating: u.singles_rating || 2.5,
      doublesRating: u.doubles_rating || 2.5,
      tags: u.tags || [],
      // Ensure admin roles are hidden from standard sync
      role: u.role === 'admin' ? 'user' : (u.role || 'user'),
      city: u.city || 'İstanbul',
      gender: u.gender || 'male',
      birthdate: u.birthdate || '1995-01-01',
      followers: u.followers || [],
      following: u.following || [],
      bio: u.bio || '',
      avatarUrl: u.avatar_url,
      bannerUrl: u.banner_url,
    }));

    const matches = (dbMatches || []).map(m => ({
      id: m.id,
      matchFormat: m.match_format,
      team1: m.team1 || [],
      team2: m.team2 || [],
      team1Score: m.team1_score,
      team2Score: m.team2_score,
      status: m.status,
      date: m.date,
      location: m.location,
      approvedBy: m.approved_by || [],
      submittedBy: m.submitted_by,
      eloChange: m.elo_change,
    }));

    return NextResponse.json({
      users,
      matches,
      directMessages: [], // mock for now
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
