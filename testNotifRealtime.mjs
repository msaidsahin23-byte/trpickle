import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealtime() {
  const { data: users } = await supabase.from('users').select('id').limit(1);
  if (!users || users.length === 0) {
    console.log("No users found to test with.");
    process.exit(1);
  }
  
  const userId = users[0].id;
  console.log("Using user ID:", userId);

  console.log("Listening for notifications...");
  
  const channel = supabase.channel('schema-db-changes-notif')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      },
      (payload) => {
        console.log("RECEIVED REALTIME NOTIFICATION:", payload);
        process.exit(0);
      }
    )
    .subscribe((status) => {
      console.log("Subscription status:", status);
      if (status === 'SUBSCRIBED') {
         supabase.from('notifications').insert({
            user_id: userId,
            type: 'system',
            message: 'Test realtime message',
            read: false
         }).then(({ error }) => {
            if (error) console.log("Insert error:", error);
            else console.log("Inserted notification, waiting for realtime event...");
         });
      }
    });
    
  setTimeout(() => {
    console.log("Timeout: Did not receive realtime event in 5 seconds.");
    process.exit(1);
  }, 7000);
}

testRealtime();
