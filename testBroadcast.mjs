import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase1 = createClient(supabaseUrl, supabaseKey);
const supabase2 = createClient(supabaseUrl, supabaseKey);

async function testBroadcast() {
  console.log("Listening for broadcast on client 1...");
  
  const channel1 = supabase1.channel('notif-channel')
    .on(
      'broadcast',
      { event: 'new_notif' },
      (payload) => {
        console.log("CLIENT 1 RECEIVED BROADCAST:", payload);
        process.exit(0);
      }
    )
    .subscribe((status) => {
      console.log("Client 1 Subscription status:", status);
      if (status === 'SUBSCRIBED') {
         // Once client 1 is subscribed, client 2 joins and sends
         const channel2 = supabase2.channel('notif-channel');
         channel2.subscribe((status2) => {
            console.log("Client 2 Subscription status:", status2);
            if (status2 === 'SUBSCRIBED') {
               channel2.send({
                  type: 'broadcast',
                  event: 'new_notif',
                  payload: { message: "Hello broadcast from 2" }
               }).then(res => {
                  console.log("Client 2 Send result:", res);
               });
            }
         });
      }
    });
    
  setTimeout(() => {
    console.log("Timeout: Did not receive broadcast in 5 seconds.");
    process.exit(1);
  }, 7000);
}

testBroadcast();
