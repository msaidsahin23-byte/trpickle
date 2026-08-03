import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealtime() {
  console.log("Setting up Realtime listener on 'posts' table...");
  const channel = supabase.channel('test-posts')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'posts' },
      (payload) => {
        console.log('REALTIME EVENT RECEIVED:', payload);
      }
    )
    .subscribe((status, err) => {
      console.log('Subscription status:', status);
      if (err) console.error('Subscription error:', err);
    });

  // Wait 3 seconds to ensure subscription is active
  await new Promise(r => setTimeout(r, 3000));

  console.log("Triggering a dummy update on posts to test realtime...");
  
  // Find a post to update
  const { data: posts } = await supabase.from('posts').select('id, content').limit(1);
  if (posts && posts.length > 0) {
    const post = posts[0];
    const { error } = await supabase.from('posts').update({ content: post.content + ' ' }).eq('id', post.id);
    if (error) {
       console.error("Failed to update post:", error);
    } else {
       console.log(`Successfully updated post ${post.id}. Waiting for realtime event...`);
    }
  } else {
    console.log("No posts found to update.");
  }

  // Keep script alive for 5 more seconds to wait for the event
  await new Promise(r => setTimeout(r, 5000));
  console.log("Test finished.");
  process.exit(0);
}

testRealtime();
