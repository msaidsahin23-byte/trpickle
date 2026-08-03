import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function testChannel() {
  const c1 = supabase.channel('my-channel');
  c1.on('broadcast', { event: 'test' }, (p) => {
    console.log("Received!", p);
  }).subscribe((status) => {
    console.log("Status c1:", status);
    if (status === 'SUBSCRIBED') {
       // Now try to send from a "new" channel reference
       try {
         const c2 = supabase.channel('my-channel');
         c2.send({ type: 'broadcast', event: 'test', payload: { a: 1 } })
           .then(res => console.log("Send result:", res))
           .catch(err => console.log("Send error:", err));
       } catch (err) {
         console.log("Error creating c2:", err);
       }
    }
  });

  setTimeout(() => process.exit(0), 5000);
}

testChannel();
