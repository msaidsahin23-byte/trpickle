import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMessages() {
  console.log("Listening for messages INSERT...");
  
  const channel = supabase.channel('schema-db-changes-' + Date.now())
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => {
        console.log("RECEIVED MESSAGE REALTIME:", payload);
        process.exit(0);
      }
    )
    .subscribe((status) => {
      console.log("Subscription status:", status);
      if (status === 'SUBSCRIBED') {
         supabase.from('messages').insert({
            id: 'test-' + Date.now(),
            sender_id: '362239f5-c274-4514-aea0-680723c6a4e9',
            receiver_id: '362239f5-c274-4514-aea0-680723c6a4e9',
            content: 'Test message',
            is_read: false
         }).then(({ error }) => {
            if (error) console.log("Insert error:", error);
            else console.log("Inserted message, waiting for realtime event...");
         });
      }
    });
    
  setTimeout(() => {
    console.log("Timeout: Did not receive realtime event in 5 seconds.");
    process.exit(1);
  }, 7000);
}

testMessages();
